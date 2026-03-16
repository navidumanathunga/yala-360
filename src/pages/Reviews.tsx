import React, { useState, useEffect } from 'react';
import { MOCK_REVIEWS } from '../constants';
import { Star, ShieldCheck, Filter, Edit3, X, ChevronDown } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { SafariType } from '../types';
import { getUserLatestBooking } from '../services/firebaseBooking';

interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  type: string;
  bookingId: string;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-white/80 backdrop-blur-md p-8 sm:p-10 border border-gold/20 shadow-lg rounded-2xl relative group hover:shadow-gold/10 hover:-translate-y-1 transition-all duration-300">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/10 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="absolute top-6 right-8 text-gold/20 flex space-x-1">
      <Star size={24} className="opacity-50" />
    </div>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="space-y-1">
        <h4 className="text-2xl serif font-bold text-gray-900">{review.userName}</h4>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full"><ShieldCheck size={12} className="mr-1" /> Verified</span>
          <span>•</span>
          <span>{review.date}</span>
        </div>
      </div>
      <div className="flex text-gold bg-gold/5 px-3 py-1.5 rounded-full">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1.5} className={i < review.rating ? "" : "text-gray-300"} />
        ))}
      </div>
    </div>
    <p className="text-gray-700 font-light italic leading-relaxed text-lg relative z-10">
      "{review.comment}"
    </p>
    <div className="mt-8 pt-6 border-t border-gold/10 flex justify-between items-center relative z-10">
      <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-md">{review.type}</span>
      <span className="text-[10px] font-bold text-gray-400">ID: {review.bookingId}</span>
    </div>
  </div>
);

const Reviews: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Recent' | 'Top Rated'>('Recent');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newReview, setNewReview] = useState({
    bookingId: '',
    rating: 5,
    comment: '',
    type: SafariType.MORNING as SafariType
  });

  const { currentUser } = useAuth();
  const [fetchedReviews, setFetchedReviews] = useState<Review[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revs = snapshot.docs.map(doc => {
        const data = doc.data();
        let dateStr = new Date().toISOString().split('T')[0];
        if (data.createdAt) {
          dateStr = new Date(data.createdAt.toMillis()).toISOString().split('T')[0];
        }
        return {
          id: doc.id,
          userName: data.userName || 'Guest',
          date: dateStr,
          rating: data.rating,
          comment: data.comment,
          type: data.type,
          bookingId: data.bookingId
        };
      });
      setFetchedReviews(revs as Review[]);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = async () => {
    if (!currentUser) {
      alert("Please sign in or create an account to write a review!");
      return;
    }
    setShowModal(true);
    
    // Auto-fill booking ID if available
    try {
      const latestBookingId = await getUserLatestBooking(currentUser.email);
      if (latestBookingId) {
        setNewReview(prev => ({ ...prev, bookingId: latestBookingId }));
      }
    } catch (err) {
      console.error("Failed to fetch latest booking ID:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.bookingId.length <= 4) {
      alert("Please enter a valid Booking ID");
      return;
    }
    if (newReview.comment.trim().length === 0) {
      alert("Please write a comment.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        userName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Guest',
        userId: currentUser?.uid,
        createdAt: serverTimestamp()
      });
      alert("Review submitted successfully!");
      setShowModal(false);
      setNewReview({ bookingId: '', rating: 5, comment: '', type: SafariType.MORNING });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extraMocks: Review[] = [
      {...MOCK_REVIEWS[0], id: '3', userName: 'Eleanor H.', comment: 'A breathtaking sunrise and we were the only jeep for miles! The density tracker really works.', type: SafariType.MORNING, date: '2024-05-15'},
      {...MOCK_REVIEWS[1], id: '4', userName: 'Markus T.', comment: 'Seamless booking and the guide was a true naturalist. Highly recommended for photography enthusiasts.', type: SafariType.FULL_DAY, date: '2024-05-20'}
  ];

  const allReviews = [...fetchedReviews, ...MOCK_REVIEWS, ...extraMocks];
  
  // Filter
  const filtered = filter === 'All' ? allReviews : allReviews.filter(r => r.type === filter);
  
  // Sort
  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortBy === 'Top Rated') {
      return b.rating - a.rating; // Descending
    }
    // Recent
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const safariTypes = ['All', ...Object.values(SafariType)];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-24 bg-beige min-h-screen">
      <div className="max-w-5xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gold/20 pb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl serif text-gray-900">Guest Chronicles</h1>
            <p className="text-gray-500 font-light italic text-lg">Real experiences from verified luxury travelers.</p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="group px-8 py-4 bg-gold text-white uppercase tracking-widest text-xs font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 rounded-sm shadow-lg hover:shadow-xl w-full md:w-auto"
          >
            <Edit3 size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Write a Review</span>
          </button>
        </header>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
            <button 
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${sortBy === 'Recent' ? 'bg-gold text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} 
              onClick={() => setSortBy('Recent')}
            >
              Recent
            </button>
            <button 
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${sortBy === 'Top Rated' ? 'bg-gold text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`} 
              onClick={() => setSortBy('Top Rated')}
            >
              Top Rated
            </button>
          </div>
          
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-auto flex items-center justify-between space-x-2 text-gray-600 bg-gray-50 px-6 py-2.5 rounded-full hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{filter === 'All' ? 'Filter By Safari' : filter}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20 animate-fadeIn">
                {safariTypes.map(type => (
                  <div 
                    key={type}
                    onClick={() => { setFilter(type); setShowDropdown(false); }}
                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-gold/10 hover:text-gold transition-colors ${filter === type ? 'bg-gold/5 text-gold font-bold' : 'text-gray-600'}`}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:gap-10">
          {sortedAndFiltered.length > 0 ? (
            sortedAndFiltered.map(r => <ReviewCard key={r.id} review={r} />)
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Star size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg serif">No reviews found for this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-beige w-full max-w-xl p-6 sm:p-12 relative animate-fadeIn rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gold transition-colors"
             >
              <X size={24} />
            </button>
            <div className="text-center mb-8 sm:mb-10 mt-4 sm:mt-0">
              <h2 className="text-3xl sm:text-4xl serif text-gray-900 mb-2">Your Experience</h2>
              <p className="text-gray-500 text-sm italic">Share your Yala adventure with the world</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gold text-left block">Booking ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Y360-1234" 
                    required
                    className="w-full p-4 border border-gold/30 rounded-lg focus:border-gold outline-none serif bg-white/50"
                    value={newReview.bookingId}
                    onChange={e => setNewReview({...newReview, bookingId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gold text-left block">Safari Type</label>
                  <select 
                    className="w-full p-4 border border-gold/30 rounded-lg focus:border-gold outline-none serif bg-white/50 cursor-pointer"
                    value={newReview.type}
                    onChange={e => setNewReview({...newReview, type: e.target.value as SafariType})}
                  >
                    {Object.values(SafariType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gold text-left block">Rating</label>
                <div className="flex space-x-2 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={32} 
                      className="cursor-pointer transition-transform hover:scale-110" 
                      fill={star <= newReview.rating ? "#C5A059" : "none"} 
                      stroke={star <= newReview.rating ? "#C5A059" : "#D1D5DB"}
                      strokeWidth={1}
                      onClick={() => setNewReview({...newReview, rating: star})}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gold text-left block">Review</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about your sightings and the guide..."
                  required
                  className="w-full p-4 border border-gold/30 rounded-lg focus:border-gold outline-none serif bg-white/50 resize-none"
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-gold text-white uppercase tracking-widest text-sm font-bold hover:bg-black transition-all rounded-lg flex justify-center items-center shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
