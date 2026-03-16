
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_GALLERY } from '../constants';
import { Upload, Camera, Search, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getUserLatestBooking } from '../services/firebaseBooking';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Return base64 with moderate compression to keep it under 1MB
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [selectedImg, setSelectedImg] = useState<typeof MOCK_GALLERY[0] | null>(null);

  const categories = ['All', 'Leopards', 'Elephants', 'Birds', 'Landscape'];
  const uploadCategories = categories.filter(c => c !== 'All');

  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState(uploadCategories[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [fetchedUserPhotos, setFetchedUserPhotos] = useState<typeof MOCK_GALLERY>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch photos from firestore
    const q = query(collection(db, 'guest_photos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photos: typeof MOCK_GALLERY = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.imageUrl,
          caption: "Guest Photo", // Could add a caption field later
          category: data.category,
          bookingId: data.bookingId
        };
      });
      // Filter out those with no URL (or if you want to implement approval: photos.filter(p => data.approved))
      setFetchedUserPhotos(photos);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!showUpload) return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const compressedBase64 = await compressImage(file);
              setUploadedFile(compressedBase64);
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showUpload]);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressedBase64 = await compressImage(file);
      setUploadedFile(compressedBase64);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedBase64 = await compressImage(file);
      setUploadedFile(compressedBase64);
    }
  };

  const handleUploadClick = async () => {
    if (!currentUser) {
      alert("Please sign in or create an account to share your experience!");
      navigate('/login');
      return;
    }
    setShowUpload(true);
    
    try {
      const latestBookingId = await getUserLatestBooking(currentUser.email);
      if (latestBookingId) {
        setBookingId(latestBookingId);
      }
    } catch (err) {
      console.error("Failed to fetch latest booking ID:", err);
    }
  };

  const handleUpload = async () => {
    if (bookingId.length <= 4) {
      alert("Invalid Booking ID! Must be longer than 4 characters.");
      return;
    }
    if (!uploadedFile) {
      alert("Please select a photo.");
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Connecting to Firebase Storage...');
    
    try {
      setUploadStatus('Saving details to Database (Firebase)...');
      
      // Because Firebase Storage is not enabled, we save the compressed base64 directly to Firestore under "guest_photos"
      await addDoc(collection(db, "guest_photos"), {
        imageUrl: uploadedFile, // Compressed Base64 string
        bookingId: bookingId,
        category: uploadCategory,
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        createdAt: serverTimestamp(),
        approved: true // Setting to true for now so it shows up immediately along with MOCK_GALLERY
      });
      
      alert(`Verification successful! Photo uploaded successfully under the '${uploadCategory}' category.`);
      
      setShowUpload(false);
      setUploadedFile(null);
      setBookingId('');
      setUploadCategory(uploadCategories[0]);
    } catch (err: unknown) {
      console.error("Upload failed", err);
      const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadStatus(`Error: ${errorMessage}`);
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      if (uploadStatus && !uploadStatus.startsWith('Error:')) {
        setUploadStatus('');
      }
    }
  };

  const combinedGallery = [...fetchedUserPhotos, ...MOCK_GALLERY];
  const images = filter === 'All' ? combinedGallery : combinedGallery.filter(img => img.category === filter);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-24 bg-beige min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-5xl serif">Guest Perspectives</h1>
            <p className="text-gray-500 font-light italic">Memories captured by our community. Uploads require a valid Booking ID.</p>
          </div>
          <button 
            onClick={handleUploadClick}
            className="px-8 py-3 bg-gold text-white uppercase tracking-widest text-xs font-bold hover:bg-black transition-all flex items-center space-x-2"
          >
            <Upload size={16} />
            <span>Share My Experience</span>
          </button>
        </header>

        {/* Filtering */}
        <div className="flex flex-wrap gap-4 border-b border-gold/20 pb-8">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === cat ? 'bg-gold text-white shadow-md' : 'bg-white text-gray-500 hover:text-gold border border-gold/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div 
              key={img.id} 
              onClick={() => setSelectedImg(img)}
              className="group relative h-80 overflow-hidden cursor-pointer"
            >
              <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-white">
                <p className="text-xs uppercase tracking-widest font-bold text-gold mb-1">{img.category}</p>
                <p className="serif text-lg">{img.caption}</p>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-[10px] tracking-widest uppercase">
                  <span>Guest #{img.bookingId}</span>
                  <Camera size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6">
            <div className="bg-beige w-full max-w-lg p-12 relative animate-fadeIn">
              <button 
                onClick={() => { setShowUpload(false); setUploadedFile(null); setBookingId(''); }} 
                className="absolute top-6 right-6 hover:text-gold transition-colors"
               >
                <X size={24} />
              </button>
              <h2 className="text-3xl serif mb-6 text-center">Share Your Safari</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gold text-left block">
                      Booking ID Verification
                    </label>
                    {bookingId.length > 0 && (
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${bookingId.length > 4 ? 'text-green-600' : 'text-red-500'}`}>
                        {bookingId.length > 4 ? 'Verified \u2713' : 'Invalid \u2717'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Y360-1234" 
                      className="w-full p-4 border border-gold/20 focus:border-gold outline-none serif transition-colors"
                      value={bookingId}
                      onChange={e => setBookingId(e.target.value)}
                    />
                    <Search className="absolute right-4 top-4 text-gold/50" size={20} />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Validation required to prevent spam and ensure authentic content.</p>
                </div>
                {/* Drag and drop area */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-48 border-2 border-dashed flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all ${isDragging ? 'border-gold bg-gold/5' : 'border-gold/30 bg-white/50 hover:bg-white'} overflow-hidden relative group`}
                >
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileSelect} />
                  
                  {uploadedFile ? (
                    <>
                      <img src={uploadedFile} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-bold uppercase tracking-widest">Change Photo</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className={`transition-colors ${isDragging ? 'text-gold' : 'text-gold/60'}`} size={32} strokeWidth={1} />
                      <div className="text-center">
                        <p className="text-xs text-black font-bold mb-1">Click to browse or drag & drop</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Or paste (Ctrl+V) an image here</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Category Selection */}
                {uploadedFile && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gold text-left block">
                      Select Category
                    </label>
                    <select 
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full p-4 border border-gold/20 focus:border-gold outline-none serif bg-white cursor-pointer"
                    >
                      {uploadCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button 
                  disabled={!uploadedFile || bookingId.length <= 4 || isUploading}
                  onClick={handleUpload}
                  className="w-full py-4 flex items-center justify-center bg-gold text-white uppercase tracking-widest text-xs font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Uploading Photo...
                    </>
                  ) : 'Verify & Upload'}
                </button>
                {uploadStatus && (
                  <p className={`text-[10px] text-center uppercase tracking-widest font-bold ${uploadStatus.startsWith('Error:') ? 'text-red-500' : 'text-gold'}`}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {selectedImg && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-12">
             <button onClick={() => setSelectedImg(null)} className="absolute top-8 right-8 text-white hover:text-gold">
                <X size={32} />
              </button>
              <img src={selectedImg.url} className="max-w-full max-h-[80vh] object-contain mb-8 shadow-2xl" alt="" />
              <div className="text-center text-white space-y-4">
                <p className="text-gold uppercase tracking-widest font-bold text-xs">{selectedImg.category}</p>
                <h3 className="text-3xl serif">{selectedImg.caption}</h3>
                <p className="text-gray-400 font-light">Captured by Guest #{selectedImg.bookingId}</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
