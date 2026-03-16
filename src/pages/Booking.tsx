import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { saveBooking } from '../services/firebaseBooking';
import { format as formatDate } from 'date-fns';
import {
  Calendar,
  Users,
  Truck,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  Info,
  Download,
  Share2,
  AlertCircle,
  Mail,
  Phone,
  Globe,
  User,
  MessageSquare,
  X,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { clsx } from 'clsx';

/* ── cn utility ── */
function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  return clsx(inputs);
}

/* ── Types ── */
interface SafariTypeObj {
  id: string;
  title: string;
  timeRange: string;
  description: string;
  highlights: string[];
  image: string;
  price: number;
}

interface BookingDetails {
  safariType: string;
  date: Date;
  visitors: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    count: number;
    specialRequests: string;
  };
  selectedDrivers: string[];
  selectedGuides: string[];
  paymentMethod: 'online' | 'onsite';
}

/* ── Constants ── */
const SAFARI_TYPES: SafariTypeObj[] = [
  {
    id: 'morning',
    title: 'Morning Safari',
    timeRange: '5:30 AM – 11:30 AM',
    description: 'Best time for leopard sightings and early wildlife activity.',
    highlights: ['Leopard Tracking', 'Bird Watching', 'Morning Mist Views'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    price: 85,
  },
  {
    id: 'evening',
    title: 'Evening Safari',
    timeRange: '2:30 PM – 6:30 PM',
    description: 'Ideal for sunset photography and active animal movement.',
    highlights: ['Sunset Photography', 'Elephant Herds', 'Golden Hour Views'],
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
    price: 75,
  },
  {
    id: 'full-day',
    title: 'Full Day Safari',
    timeRange: '5:30 AM – 6:30 PM',
    description: 'Complete wildlife exploration with extended park access.',
    highlights: ['Maximum Park Coverage', 'Picnic Lunch', 'Diverse Ecosystems'],
    image: 'https://images.unsplash.com/photo-1705936981595-dea87508ce84?auto=format&fit=crop&q=80&w=800',
    price: 150,
  },
];

const MOCK_DRIVERS = [
  { id: 'd1', name: 'Kasun Perera',   image: 'https://picsum.photos/seed/driver1/300/300', rating: 4.9, experienceYears: 12, safariCount: 1240, vehicleType: 'Toyota Hilux 4x4',       capacity: 6, languages: 'English, Sinhala' },
  { id: 'd2', name: 'Nimal Silva',    image: 'https://picsum.photos/seed/driver2/300/300', rating: 4.8, experienceYears: 8,  safariCount: 850,  vehicleType: 'Land Rover Defender',     capacity: 6, languages: 'English, German, Sinhala' },
  { id: 'd3', name: 'Sunil Gamage',   image: 'https://picsum.photos/seed/driver3/300/300', rating: 4.7, experienceYears: 15, safariCount: 2100, vehicleType: 'Mitsubishi L200',         capacity: 6, languages: 'English, Sinhala' },
  { id: 'd4', name: 'Aruna Kumara',   image: 'https://picsum.photos/seed/driver4/300/300', rating: 4.9, experienceYears: 5,  safariCount: 560,  vehicleType: 'Toyota Land Cruiser',     capacity: 6, languages: 'English, French, Sinhala' },
];

const MOCK_GUIDES = [
  { id: 'g1', name: 'Chaminda Bandara',   image: 'https://picsum.photos/seed/guide1/300/300', rating: 4.9, experienceYears: 10, languages: 'English, German, Sinhala', specialty: 'Wildlife Tracking', bio: 'Expert in wildlife behavior. Specializes in leopard and sloth bear sightings.' },
  { id: 'g2', name: 'Lakmal Rathnayake', image: 'https://picsum.photos/seed/guide2/300/300', rating: 4.7, experienceYears: 6,  languages: 'English, French, Sinhala', specialty: 'Bird Watching',     bio: 'Passionate about bird watching and environmental conservation. Great with families.' },
];

const STEPS = ['Safari Type', 'Date & Crowd', 'Visitor Details', 'Jeep & Driver', 'Review & Pay', 'Confirmation'];
const GOLD = '#C5A059';

/* ── Notification ── */
function Notification({ message, type = 'error', onClose }: { message: string; type?: 'error' | 'success'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 20, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className={cn(
        'fixed top-0 left-1/2 z-[200] flex items-center gap-3 px-6 py-4 shadow-2xl min-w-[320px]',
        type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
      )}
    >
      {type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN BOOKING COMPONENT
════════════════════════════════════════ */
export default function Booking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [booking, setBooking] = useState<Partial<BookingDetails>>({
    visitors: { fullName: '', email: '', phone: '', country: '', count: 1, specialRequests: '' },
    selectedDrivers: [],
    selectedGuides: [],
    paymentMethod: 'online',
  });

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1SafariType booking={booking} setBooking={setBooking} onNext={nextStep} />;
      case 2: return <Step2DateCrowd booking={booking} setBooking={setBooking} onNext={nextStep} onPrev={prevStep} />;
      case 3: return <Step3VisitorDetails booking={booking} setBooking={setBooking} onNext={nextStep} onPrev={prevStep} />;
      case 4: return <Step4JeepDriver booking={booking} setBooking={setBooking} onNext={nextStep} onPrev={prevStep} />;
      case 5: return <Step5ReviewPayment booking={booking} setBooking={setBooking} onNext={nextStep} onPrev={prevStep} setConfirmationData={setConfirmationData} />;
      case 6: return <Step6Confirmation booking={booking} confirmationData={confirmationData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-beige pb-20 pt-28">
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Progress Bar ── */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex justify-between min-w-[600px]">
            {STEPS.map((step, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-white text-sm font-bold',
                      isActive     ? 'border-gold bg-gold text-white shadow-lg scale-110' :
                      isCompleted  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' :
                                     'border-gold/30 text-gold/50'
                    )}
                    style={isActive ? { borderColor: GOLD, background: GOLD } : isCompleted ? {} : {}}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  <span className={cn('mt-2 text-xs font-bold uppercase tracking-tighter text-center', isActive ? 'text-[#1A1A1A]' : 'text-gold/50')}>
                    {step}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn('absolute top-5 left-[50%] w-full h-[2px] -z-0', isCompleted ? 'bg-[#1A1A1A]' : 'bg-gold/20')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════ STEP 1 — Safari Type ════ */
function Step1SafariType({ booking, setBooking, onNext }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: GOLD }}>Step 1</p>
        <h2 className="text-3xl md:text-4xl serif text-gray-900">Choose Your Adventure</h2>
        <p className="text-gray-500 font-light">Select the safari experience that best suits your wildlife goals.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {SAFARI_TYPES.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ y: -5 }}
            onClick={() => setBooking({ ...booking, safariType: type.id })}
            className={cn(
              'bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group shadow-sm'
            )}
            style={booking.safariType === type.id
              ? { boxShadow: `0 20px 60px rgba(197,160,89,0.25)`, outline: `2px solid ${GOLD}` }
              : { outline: '2px solid transparent' }}
          >
            <div className="h-48 overflow-hidden relative">
              <img src={type.image} alt={type.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-80">
                  <Clock className="w-3 h-3" /> {type.timeRange}
                </div>
                <h3 className="text-xl serif">{type.title}</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-600 font-light leading-relaxed flex-1">{type.description}</p>
                <div className="text-right ml-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">From</p>
                  <p className="text-xl serif text-gray-900">${type.price}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Highlights</p>
                <ul className="space-y-1">
                  {type.highlights.map(h => (
                    <li key={h} className="text-xs flex items-center gap-2 text-gray-600 font-light">
                      <div className="w-1 h-1 rounded-full" style={{ background: GOLD }} /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          disabled={!booking.safariType}
          className="flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: GOLD }}
        >
          Continue to Date Selection <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ════ STEP 2 — Date & Crowd ════ */
function Step2DateCrowd({ booking, setBooking, onNext, onPrev }: any) {
  const [selectedDate, setSelectedDate] = useState<Date>(booking.date || addDays(new Date(), 1));
  const safariType = SAFARI_TYPES.find(t => t.id === booking.safariType);

  const availableDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) dates.push(addDays(now, i));
    return dates;
  }, []);

  // Mock density based on date
  const mockSlots = useMemo(() => {
    const seed = selectedDate.getDate();
    return [
      { id: 's1', timeRange: '06:00 AM – 08:00 AM', currentDensity: (seed * 3) % 60, expectedDensity: (seed * 5) % 80 },
      { id: 's2', timeRange: '08:00 AM – 10:00 AM', currentDensity: (seed * 7) % 70, expectedDensity: (seed * 4) % 90 },
      { id: 's3', timeRange: '10:00 AM – 12:00 PM', currentDensity: (seed * 2) % 40, expectedDensity: (seed * 6) % 65 },
    ];
  }, [selectedDate]);

  const getDensityLevel = (count: number) => {
    if (count < 20) return { label: 'Low',      color: 'bg-emerald-500' };
    if (count < 50) return { label: 'Moderate', color: 'bg-amber-500'   };
    return              { label: 'High',     color: 'bg-rose-500'    };
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ background: 'rgba(197,160,89,0.1)', color: GOLD }}>
          Selected: {safariType?.title}
        </div>
        <h2 className="text-3xl md:text-4xl serif text-gray-900">Select Date & Time</h2>
        <p className="text-gray-500 font-light">Plan your visit based on real-time park congestion levels.</p>
      </div>

      {/* Date Selector */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
          <Calendar className="w-4 h-4" /> Available Dates
        </label>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {availableDates.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <div
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'min-w-[90px] p-4 bg-white cursor-pointer transition-all text-center border-2',
                  isSelected ? 'shadow-lg' : 'border-transparent hover:border-gold/30 border-gray-100'
                )}
                style={isSelected ? { borderColor: GOLD } : {}}
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-400">{format(date, 'EEE')}</p>
                <p className="text-2xl serif text-gray-900">{format(date, 'd')}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{format(date, 'MMM')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Density Slots */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
            <Clock className="w-4 h-4" /> Jeep Density by Time Slot
          </label>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Moderate</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> High</span>
          </div>
        </div>
        {mockSlots.map((slot) => {
          const curr = getDensityLevel(slot.currentDensity);
          const exp  = getDensityLevel(slot.expectedDensity);
          return (
            <div key={slot.id} className="bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(197,160,89,0.15)' }}>
                  <Clock className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="serif text-lg text-gray-900">{slot.timeRange}</h4>
                  <p className="text-xs text-gray-400">2-hour segment tracking</p>
                </div>
              </div>
              <div className="flex flex-1 gap-8 md:justify-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current</p>
                  <div className="flex items-center gap-2">
                    <div className={cn('px-2 py-0.5 text-[10px] font-bold text-white', curr.color)}>{curr.label}</div>
                    <span className="text-sm font-medium text-gray-700">{slot.currentDensity} Jeeps</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expected</p>
                  <div className="flex items-center gap-2">
                    <div className={cn('px-2 py-0.5 text-[10px] font-bold text-white', exp.color)}>{exp.label}</div>
                    <span className="text-sm font-medium text-gray-700">{slot.expectedDensity} Jeeps</span>
                    <div className="group relative">
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        Expected crowd based on past 3 days and current bookings.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-600 font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={() => { setBooking({ ...booking, date: selectedDate }); onNext(); }} className="flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-sm text-white transition-all" style={{ background: GOLD }}>
          Continue to Details <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ════ STEP 3 — Visitor Details ════ */
function Step3VisitorDetails({ booking, setBooking, onNext, onPrev }: any) {
  const [formData, setFormData] = useState(booking.visitors);
  const [errors, setErrors] = useState<any>({});
  const [notification, setNotification] = useState<string | null>(null);

  const validate = () => {
    const e: any = {};
    if (!formData.fullName) e.fullName = 'Full name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Valid email is required';
    if (!formData.phone) e.phone = 'Phone number is required';
    if (!formData.country) e.country = 'Country is required';
    setErrors(e);
    if (Object.keys(e).length > 0) { setNotification('Please correct the highlighted fields.'); return false; }
    return true;
  };

  const handleContinue = () => {
    if (validate()) { setBooking({ ...booking, visitors: formData }); onNext(); }
  };

  const inputClass = (field: string) => cn(
    'w-full bg-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all text-gray-800',
    errors[field] ? 'border-rose-400' : 'border-gray-200 focus:border-gold'
  );

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: GOLD }}>Step 3</p>
        <h2 className="text-3xl md:text-4xl serif text-gray-900">Visitor Information</h2>
        <p className="text-gray-500 font-light">Please provide your details to personalize your safari experience.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleContinue(); }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
              <User className="w-3 h-3" /> Full Name
            </label>
            <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className={inputClass('fullName')} placeholder="John Doe" />
            {errors.fullName && <p className="text-rose-500 text-[10px] font-bold">{errors.fullName}</p>}
          </div>
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass('email')} placeholder="john@example.com" />
            {errors.email && <p className="text-rose-500 text-[10px] font-bold">{errors.email}</p>}
          </div>
          {/* Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
              <Phone className="w-3 h-3" /> Phone Number
            </label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass('phone')} placeholder="+1 234 567 890" />
            {errors.phone && <p className="text-rose-500 text-[10px] font-bold">{errors.phone}</p>}
          </div>
          {/* Country */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
              <Globe className="w-3 h-3" /> Country
            </label>
            <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className={inputClass('country')} placeholder="United Kingdom" />
            {errors.country && <p className="text-rose-500 text-[10px] font-bold">{errors.country}</p>}
          </div>
          {/* Visitor Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
              <Users className="w-3 h-3" /> Number of Visitors
            </label>
            <div className="flex items-center gap-6 p-2 border border-gray-200 rounded-2xl w-fit bg-gray-50">
              <button type="button" onClick={() => setFormData({ ...formData, count: Math.max(1, formData.count - 1) })} className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center rounded-xl hover:border-gold hover:text-gold transition-all font-bold">-</button>
              <span className="text-2xl serif w-8 text-center">{formData.count}</span>
              <button type="button" onClick={() => setFormData({ ...formData, count: formData.count + 1 })} className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center rounded-xl hover:border-gold hover:text-gold transition-all font-bold">+</button>
            </div>
          </div>
        </div>
        {/* Special Requests */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
            <MessageSquare className="w-3 h-3" /> Special Requests (Optional)
          </label>
          <textarea value={formData.specialRequests} onChange={e => setFormData({ ...formData, specialRequests: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 outline-none min-h-[120px] transition-all text-gray-800" placeholder="Any allergies, specific wildlife interests, or accessibility needs..." />
        </div>
      </form>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-600 font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={handleContinue} className="flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-sm text-white transition-all" style={{ background: GOLD }}>
          Continue to Jeep Selection <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ════ STEP 4 — Jeep & Driver ════ */
function Step4JeepDriver({ booking, setBooking, onNext, onPrev }: any) {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(booking.selectedDrivers || []);
  const [selectedGuides, setSelectedGuides] = useState<string[]>(booking.selectedGuides || []);
  const [showProfile, setShowProfile] = useState<any>(null);

  const recommendedJeeps = Math.ceil((booking.visitors?.count || 1) / 6);

  const toggleDriver = (id: string) => {
    if (selectedDrivers.includes(id)) setSelectedDrivers(selectedDrivers.filter(d => d !== id));
    else if (selectedDrivers.length < recommendedJeeps) setSelectedDrivers([...selectedDrivers, id]);
  };
  const toggleGuide = (id: string) => {
    if (selectedGuides.includes(id)) setSelectedGuides(selectedGuides.filter(g => g !== id));
    else setSelectedGuides([...selectedGuides, id]);
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: GOLD }}>Step 4</p>
        <h2 className="text-3xl md:text-4xl serif text-gray-900">Jeep & Driver Selection</h2>
        <p className="text-gray-500 font-light">Based on your group size, we recommend {recommendedJeeps} jeep{recommendedJeeps > 1 ? 's' : ''}.</p>
      </div>

      {/* Smart Recommendation Banner */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: GOLD }}>
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="serif text-lg text-gray-900">Smart Recommendation</h4>
            <p className="text-xs text-gray-400">Max 6 passengers per vehicle for comfort.</p>
          </div>
        </div>
        <button onClick={() => setSelectedDrivers(MOCK_DRIVERS.slice(0, recommendedJeeps).map(d => d.id))} className="text-sm font-bold uppercase tracking-widest border-b pb-1 hover:opacity-70 transition-opacity" style={{ borderColor: GOLD, color: GOLD }}>
          Auto-Select Best Driver for Me
        </button>
      </div>

      {/* Drivers */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
          <Truck className="w-4 h-4" /> Select {recommendedJeeps} Driver{recommendedJeeps > 1 ? 's' : ''} ({selectedDrivers.length}/{recommendedJeeps})
        </label>
        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_DRIVERS.map((driver) => (
            <div key={driver.id} className={cn('bg-white p-6 transition-all border-2', selectedDrivers.includes(driver.id) ? 'shadow-xl' : 'border-transparent border-gray-100 hover:border-gold/30')} style={selectedDrivers.includes(driver.id) ? { borderColor: GOLD } : {}}>
              <div className="flex gap-4">
                <div className="relative">
                  <img src={driver.image} alt={driver.name} className="w-20 h-20 object-cover" />
                  <div className="absolute -bottom-2 -right-2 text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-1" style={{ background: GOLD }}>
                    <Star className="w-2 h-2 fill-current" /> {driver.rating}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="serif text-lg text-gray-900">{driver.name}</h4>
                    <button onClick={() => setShowProfile({ type: 'driver', data: driver })} className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70" style={{ color: GOLD }}>View Profile</button>
                  </div>
                  <p className="text-xs text-gray-400">{driver.experienceYears} Yrs Exp • {driver.safariCount}+ Safaris</p>
                  <p className="text-xs font-medium text-gray-700">{driver.vehicleType} (Cap: {driver.capacity})</p>
                  <p className="text-xs text-gray-400">{driver.languages}</p>
                </div>
              </div>
              <button onClick={() => toggleDriver(driver.id)} className={cn('w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest transition-all', selectedDrivers.includes(driver.id) ? 'text-white bg-[#1A1A1A]' : 'text-gray-700 bg-gray-100 hover:text-white')} style={!selectedDrivers.includes(driver.id) ? { backgroundColor: undefined } : {}}>
                {selectedDrivers.includes(driver.id) ? '✓ Selected' : 'Select Driver'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Guides */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
          <Users className="w-4 h-4" /> Optional Wildlife Guide
        </label>
        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_GUIDES.map((guide) => (
            <div key={guide.id} className={cn('bg-white p-6 transition-all border-2', selectedGuides.includes(guide.id) ? 'shadow-xl' : 'border-transparent border-gray-100 hover:border-gold/30')} style={selectedGuides.includes(guide.id) ? { borderColor: GOLD } : {}}>
              <div className="flex gap-4">
                <div className="relative">
                  <img src={guide.image} alt={guide.name} className="w-20 h-20 object-cover" />
                  <div className="absolute -bottom-2 -right-2 text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-1" style={{ background: GOLD }}>
                    <Star className="w-2 h-2 fill-current" /> {guide.rating}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="serif text-lg text-gray-900">{guide.name}</h4>
                    <button onClick={() => setShowProfile({ type: 'guide', data: guide })} className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70" style={{ color: GOLD }}>View Profile</button>
                  </div>
                  <p className="text-xs text-gray-400">{guide.experienceYears} Yrs Experience</p>
                  <p className="text-xs text-gray-400">{guide.languages}</p>
                  <span className="text-[9px] px-2 py-0.5 font-medium" style={{ background: 'rgba(197,160,89,0.15)', color: GOLD }}>{guide.specialty}</span>
                </div>
              </div>
              <button onClick={() => toggleGuide(guide.id)} className={cn('w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest transition-all', selectedGuides.includes(guide.id) ? 'text-white bg-[#1A1A1A]' : 'text-gray-700 bg-gray-100 hover:text-white')}>
                {selectedGuides.includes(guide.id) ? '✓ Selected' : 'Add Guide'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-600 font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={() => { setBooking({ ...booking, selectedDrivers, selectedGuides }); onNext(); }} disabled={selectedDrivers.length < recommendedJeeps} className="flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: GOLD }}>
          Review & Payment <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfile(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg overflow-hidden relative z-10 shadow-2xl">
              <div className="h-36 bg-[#1A1A1A] relative">
                <img src={showProfile.data.image} alt="" className="w-24 h-24 absolute -bottom-12 left-8 border-4 border-white shadow-xl object-cover" />
              </div>
              <div className="p-8 pt-16 space-y-6">
                <div>
                  <h3 className="text-2xl serif text-gray-900">{showProfile.data.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: GOLD }}>
                    {showProfile.type === 'driver' ? 'Expert Safari Driver' : 'Professional Wildlife Guide'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3" style={{ background: 'rgba(197,160,89,0.1)' }}>
                    <p className="text-lg serif text-gray-900">{showProfile.data.rating}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Rating</p>
                  </div>
                  <div className="p-3" style={{ background: 'rgba(197,160,89,0.1)' }}>
                    <p className="text-lg serif text-gray-900">{showProfile.data.experienceYears}y</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Exp</p>
                  </div>
                  <div className="p-3" style={{ background: 'rgba(197,160,89,0.1)' }}>
                    <p className="text-lg serif text-gray-900">{showProfile.type === 'driver' ? showProfile.data.safariCount : showProfile.data.languages.split(',').length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{showProfile.type === 'driver' ? 'Safaris' : 'Languages'}</p>
                  </div>
                </div>
                {showProfile.type === 'guide' && (
                  <div className="p-4 border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
                    "{showProfile.data.bio}"
                  </div>
                )}
                <button onClick={() => setShowProfile(null)} className="w-full py-4 font-bold uppercase tracking-widest text-sm text-white" style={{ background: GOLD }}>Close Profile</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════ STEP 5 — Review & Pay ════ */
function Step5ReviewPayment({ booking, setBooking, onNext, onPrev, setConfirmationData }: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const safariType = SAFARI_TYPES.find(t => t.id === booking.safariType);
  const totalPrice = ((safariType?.price || 85) * (booking.visitors?.count || 1)) + (booking.selectedDrivers.length * 80) + (booking.selectedGuides?.length > 0 ? 40 : 0);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const bookingId = `Y360-${Math.floor(Math.random() * 90000 + 10000)}`;
      const driverDetails = MOCK_DRIVERS.find(d => d.id === booking.selectedDrivers[0]) || MOCK_DRIVERS[0];
      const safariDetails = {
        startTime: safariType?.timeRange.split(' – ')[0],
        endTime: safariType?.timeRange.split(' – ')[1],
        totalJeeps: booking.selectedDrivers.length,
      };

      // Save to Firebase Firestore
      await saveBooking({
        bookingId,
        touristName: booking.visitors?.fullName || '',
        email: booking.visitors?.email || '',
        phone: booking.visitors?.phone || '',
        country: booking.visitors?.country || '',
        safariType: booking.safariType || '',
        safariTitle: safariType?.title || '',
        date: booking.date ? formatDate(booking.date, 'yyyy-MM-dd') : '',
        visitors: booking.visitors?.count || 1,
        driverIds: booking.selectedDrivers || [],
        guideIds: booking.selectedGuides || [],
        paymentMethod: booking.paymentMethod || 'onsite',
        paymentStatus: booking.paymentMethod === 'online' ? 'Paid' : 'Pending',
        status: 'Confirmed',
        totalPrice,
        driverName: driverDetails.name,
        vehicleType: driverDetails.vehicleType,
        specialRequests: booking.visitors?.specialRequests || '',
      });

      setConfirmationData({ bookingId, driverDetails, safariDetails });
      onNext();
    } catch (err) {
      console.error('Booking save error:', err);
      alert('Booking failed to save. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: GOLD }}>Step 5</p>
        <h2 className="text-3xl md:text-4xl serif text-gray-900">Review & Payment</h2>
        <p className="text-gray-500 font-light">Confirm your booking details and choose a payment method.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Booking Summary Card */}
          <div className="bg-white p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
              <div>
                <h3 className="text-2xl serif text-gray-900">{safariType?.title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1" style={{ color: GOLD }}>
                  <Calendar className="w-3 h-3" /> {booking.date ? format(booking.date, 'MMMM d, yyyy') : 'Date not set'}
                </p>
              </div>
              <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Available</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Visitor Details</h5>
                <p className="text-sm font-medium text-gray-900">{booking.visitors?.fullName}</p>
                <p className="text-xs text-gray-400">{booking.visitors?.email}</p>
                <p className="text-xs text-gray-400">{booking.visitors?.count} Visitors</p>
              </div>
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Safari Crew</h5>
                <p className="text-sm font-medium text-gray-900">{booking.selectedDrivers?.length} Jeep{booking.selectedDrivers?.length > 1 ? 's' : ''} with Drivers</p>
                {booking.selectedGuides?.length > 0 && <p className="text-xs text-gray-400">+ Wildlife Guide</p>}
              </div>
            </div>
            <div className="p-4 flex items-center gap-4" style={{ background: 'rgba(197,160,89,0.08)' }}>
              <Info className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
              <p className="text-xs text-gray-600">We recommend arriving 15 minutes early at the park entrance gate.</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Select Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'online', label: 'Online Payment', sub: 'Secure Credit/Debit Card', Icon: CreditCard },
                { id: 'onsite', label: 'On-Site Payment', sub: 'Pay at Park Entrance', Icon: MapPin },
              ].map(({ id, label, sub, Icon }) => (
                <div key={id} onClick={() => setBooking({ ...booking, paymentMethod: id })} className={cn('bg-white p-6 cursor-pointer transition-all border-2 flex flex-col items-center gap-3', booking.paymentMethod === id ? 'shadow-lg' : 'border-gray-100 hover:border-gold/30')} style={booking.paymentMethod === id ? { borderColor: GOLD } : {}}>
                  <Icon className="w-8 h-8 text-gray-700" />
                  <div className="text-center">
                    <p className="serif text-gray-900">{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div>
          <div className="bg-white p-6 shadow-sm border border-gray-100 sticky top-32 space-y-6">
            <h4 className="text-lg serif text-gray-900">Price Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{safariType?.title} × {booking.visitors?.count}</span>
                <span className="font-medium text-gray-900">${(safariType?.price || 85) * (booking.visitors?.count || 1)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{booking.selectedDrivers?.length} Jeep Rental</span>
                <span className="font-medium text-gray-900">${booking.selectedDrivers?.length * 80}</span>
              </div>
              {booking.selectedGuides?.length > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Pro Guide Service</span>
                  <span className="font-medium text-gray-900">$40</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <span className="text-lg serif text-gray-900">Total</span>
                <span className="text-2xl serif font-bold" style={{ color: GOLD }}>${totalPrice}</span>
              </div>
            </div>
            <button onClick={handleConfirm} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-widest text-sm text-white transition-all disabled:opacity-70" style={{ background: GOLD }}>
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{booking.paymentMethod === 'online' ? 'Pay Now' : 'Confirm Booking'} <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-400">By confirming, you agree to our terms of service and cancellation policy.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-start pt-4">
        <button onClick={onPrev} className="flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-600 font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
      </div>
    </div>
  );
}

/* ════ STEP 6 — Confirmation ════ */
function Step6Confirmation({ booking, confirmationData }: any) {
  const qrRef = useRef<HTMLDivElement>(null);
  const { bookingId, driverDetails, safariDetails } = confirmationData || {};
  const safariType = SAFARI_TYPES.find(t => t.id === booking.safariType);
  const dateStr = booking.date ? format(booking.date, 'MMMM d, yyyy') : '';
  const totalPrice = ((safariType?.price || 85) * (booking.visitors?.count || 1)) + ((booking.selectedDrivers?.length || 0) * 80) + ((booking.selectedGuides?.length || 0) > 0 ? 40 : 0);

  // QR code data — encodes all key booking info
  const qrData = JSON.stringify({
    id: bookingId,
    safari: safariType?.title,
    date: dateStr,
    time: `${safariDetails?.startTime} – ${safariDetails?.endTime}`,
    visitors: booking.visitors?.count,
    jeeps: safariDetails?.totalJeeps,
    driver: driverDetails?.name,
    guest: booking.visitors?.fullName,
    total: `$${totalPrice}`,
  });

  // Download Receipt as a beautifully styled PDF
  const handleDownloadReceipt = useCallback(() => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const goldR = 197, goldG = 160, goldB = 89;
    const darkR = 26, darkG = 26, darkB = 26;
    let y = 0;

    // ── Dark header band ──
    doc.setFillColor(darkR, darkG, darkB);
    doc.rect(0, 0, pw, 52, 'F');

    // Gold accent line
    doc.setFillColor(goldR, goldG, goldB);
    doc.rect(0, 52, pw, 1.5, 'F');

    // YALA360 logo text
    doc.setTextColor(goldR, goldG, goldB);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('YALA360', 20, 22);

    // Subtitle
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('LUXURY SAFARI EXPERIENCE', 20, 30);

    // Receipt title right side
    doc.setFontSize(11);
    doc.setTextColor(goldR, goldG, goldB);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING RECEIPT', pw - 20, 20, { align: 'right' });

    // Booking ID right
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(bookingId, pw - 20, 30, { align: 'right' });

    // Date right
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(dateStr, pw - 20, 38, { align: 'right' });

    // Payment status badge
    doc.setFontSize(7);
    const badgeText = booking.paymentMethod === 'online' ? 'PAID ONLINE' : 'PAY ON SITE';
    const badgeW = doc.getTextWidth(badgeText) + 8;
    doc.setFillColor(goldR, goldG, goldB);
    doc.roundedRect(pw - 20 - badgeW, 42, badgeW, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(badgeText, pw - 20 - badgeW / 2, 46.2, { align: 'center' });

    y = 62;

    // ── Helper: section header ──
    const drawSectionHeader = (title: string, yPos: number) => {
      doc.setFillColor(goldR, goldG, goldB);
      doc.rect(20, yPos, 3, 6, 'F');
      doc.setFontSize(9);
      doc.setTextColor(goldR, goldG, goldB);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), 26, yPos + 4.5);
      doc.setDrawColor(230, 230, 230);
      doc.line(26 + doc.getTextWidth(title.toUpperCase()) + 3, yPos + 3, pw - 20, yPos + 3);
      return yPos + 12;
    };

    // ── Helper: label + value row ──
    const drawRow = (label: string, value: string, yPos: number) => {
      doc.setFontSize(8.5);
      doc.setTextColor(140, 140, 140);
      doc.setFont('helvetica', 'normal');
      doc.text(label, 26, yPos);
      doc.setTextColor(darkR, darkG, darkB);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, yPos);
      return yPos + 7;
    };

    // ── Safari Details Section ──
    y = drawSectionHeader('Safari Details', y);
    y = drawRow('Safari Type', safariType?.title || '', y);
    y = drawRow('Time', `${safariDetails?.startTime || ''} - ${safariDetails?.endTime || ''}`, y);
    y = drawRow('Location', 'Yala National Park, Entrance Gate 1', y);
    y += 4;

    // ── Visitor Details Section ──
    y = drawSectionHeader('Visitor Information', y);
    y = drawRow('Full Name', booking.visitors?.fullName || '', y);
    y = drawRow('Email', booking.visitors?.email || '', y);
    y = drawRow('Phone', booking.visitors?.phone || '', y);
    y = drawRow('Country', booking.visitors?.country || '', y);
    y = drawRow('Visitors', String(booking.visitors?.count || 1), y);
    if (booking.visitors?.specialRequests) {
      y = drawRow('Special Requests', booking.visitors.specialRequests, y);
    }
    y += 4;

    // ── Safari Crew Section ──
    y = drawSectionHeader('Safari Crew', y);
    y = drawRow('Total Jeeps', String(safariDetails?.totalJeeps || 1), y);
    y = drawRow('Primary Driver', driverDetails?.name || '', y);
    y = drawRow('Vehicle', driverDetails?.vehicleType || '', y);
    if (booking.selectedGuides?.length > 0) {
      y = drawRow('Wildlife Guide', 'Professional Guide Assigned', y);
    }
    y += 6;

    // ── Pricing Table ──
    y = drawSectionHeader('Price Breakdown', y);
    // Table header
    doc.setFillColor(248, 248, 248);
    doc.rect(26, y - 2, pw - 46, 8, 'F');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', 30, y + 3);
    doc.text('AMOUNT', pw - 24, y + 3, { align: 'right' });
    y += 10;

    // Price rows
    const safariTotal = (safariType?.price || 85) * (booking.visitors?.count || 1);
    const jeepTotal = (booking.selectedDrivers?.length || 0) * 80;

    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`${safariType?.title} x ${booking.visitors?.count || 1}`, 30, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${safariTotal}.00`, pw - 24, y, { align: 'right' });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`Jeep Rental x ${booking.selectedDrivers?.length || 0}`, 30, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${jeepTotal}.00`, pw - 24, y, { align: 'right' });
    y += 7;

    if (booking.selectedGuides?.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Guide Service', 30, y);
      doc.setFont('helvetica', 'bold');
      doc.text('$40.00', pw - 24, y, { align: 'right' });
      y += 7;
    }

    // Total line
    doc.setDrawColor(goldR, goldG, goldB);
    doc.setLineWidth(0.5);
    doc.line(26, y, pw - 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(darkR, darkG, darkB);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 30, y);
    doc.setTextColor(goldR, goldG, goldB);
    doc.setFontSize(14);
    doc.text(`$${totalPrice}.00`, pw - 24, y, { align: 'right' });
    y += 12;

    // ── QR Code embed ──
    if (qrRef.current) {
      const svgEl = qrRef.current.querySelector('svg');
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 300, 300);
            ctx.drawImage(img, 0, 0, 300, 300);
            const qrImg = canvas.toDataURL('image/png');

            // Position QR code in the top-right corner below the header
            const qrWidth = 45;
            const qrHeight = 52;
            const qrX = pw - 20 - qrWidth; // Right align with margin
            const qrY = 65;

            // Pass container
            doc.setFillColor(248, 248, 248);
            doc.roundedRect(qrX, qrY, qrWidth, qrHeight, 2, 2, 'F');
            doc.setDrawColor(goldR, goldG, goldB);
            doc.setLineWidth(0.3);
            doc.roundedRect(qrX, qrY, qrWidth, qrHeight, 2, 2, 'S');
            
            // QR Image
            doc.addImage(qrImg, 'PNG', qrX + (qrWidth - 30) / 2, qrY + 4, 30, 30);
            
            // Text below QR
            doc.setFontSize(7);
            doc.setTextColor(darkR, darkG, darkB);
            doc.setFont('helvetica', 'bold');
            doc.text('PASS: ' + bookingId, qrX + qrWidth / 2, qrY + 39, { align: 'center' });
            doc.setFontSize(6);
            doc.setTextColor(140, 140, 140);
            doc.setFont('helvetica', 'normal');
            doc.text('DIGITAL BOARDING PASS', qrX + qrWidth / 2, qrY + 44, { align: 'center' });
            doc.text('Show this for check-in', qrX + qrWidth / 2, qrY + 48, { align: 'center' });

            // ── Footer ──
            const footerY = 275;
            doc.setFillColor(darkR, darkG, darkB);
            doc.rect(0, footerY - 5, pw, 25, 'F');
            doc.setFillColor(goldR, goldG, goldB);
            doc.rect(0, footerY - 5, pw, 1, 'F');

            doc.setFontSize(8);
            doc.setTextColor(goldR, goldG, goldB);
            doc.setFont('helvetica', 'bold');
            doc.text('YALA360', 20, footerY + 3);
            doc.setFontSize(6);
            doc.setTextColor(180, 180, 180);
            doc.setFont('helvetica', 'normal');
            doc.text('Elevating the Sri Lankan safari experience', 20, footerY + 8);
            doc.text('through technology and luxury.', 20, footerY + 12);

            doc.setFontSize(6);
            doc.setTextColor(180, 180, 180);
            doc.text('info@yala360.com  |  +94 (0) 77 123 4567', pw - 20, footerY + 3, { align: 'right' });
            doc.text('www.yala360.com', pw - 20, footerY + 8, { align: 'right' });

            // Save
            doc.save(`YALA360_Receipt_${bookingId}.pdf`);
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
          return; // wait for img.onload
        }
      }
    }

    // Fallback if QR can't be embedded
    const footerY = 275;
    doc.setFillColor(darkR, darkG, darkB);
    doc.rect(0, footerY - 5, pw, 25, 'F');
    doc.setFillColor(goldR, goldG, goldB);
    doc.rect(0, footerY - 5, pw, 1, 'F');
    doc.setFontSize(8);
    doc.setTextColor(goldR, goldG, goldB);
    doc.setFont('helvetica', 'bold');
    doc.text('YALA360', 20, footerY + 3);
    doc.setFontSize(6);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text('info@yala360.com  |  +94 (0) 77 123 4567', pw - 20, footerY + 3, { align: 'right' });
    doc.save(`YALA360_Receipt_${bookingId}.pdf`);
  }, [bookingId, dateStr, safariType, safariDetails, driverDetails, booking, totalPrice]);

  // Share via Email — opens mailto with pre-filled subject and body
  const handleShareEmail = useCallback(() => {
    const subject = encodeURIComponent(`YALA360 Safari Booking Confirmation — ${bookingId}`);
    const body = encodeURIComponent(
      `Hi,\n\nHere are the details of my YALA360 safari booking:\n\n` +
      `🎫 Booking ID: ${bookingId}\n` +
      `📅 Date: ${dateStr}\n` +
      `🦁 Safari: ${safariType?.title} (${safariDetails?.startTime} – ${safariDetails?.endTime})\n` +
      `👥 Visitors: ${booking.visitors?.count}\n` +
      `🚙 Jeeps: ${safariDetails?.totalJeeps}\n` +
      `🧑‍✈️ Driver: ${driverDetails?.name} — ${driverDetails?.vehicleType}\n` +
      `📍 Location: Yala National Park, Entrance Gate 1\n` +
      `💰 Total: $${totalPrice}\n\n` +
      `Book your own safari at YALA360!\n`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }, [bookingId, dateStr, safariType, safariDetails, driverDetails, booking, totalPrice]);

  // Download QR code as PNG image
  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svgEl = qrRef.current.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `YALA360_QR_${bookingId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [bookingId]);

  if (!confirmationData) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-8">
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h2 className="text-4xl serif text-gray-900">Booking Confirmed!</h2>
        <p className="text-gray-500 font-light">Your luxury safari adventure is ready. We've sent the details to your email.</p>
      </div>

      <div className="bg-white shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1A1A] p-8 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Booking ID</p>
            <h3 className="text-2xl serif tracking-widest" style={{ color: GOLD }}>{bookingId}</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/50">Date</p>
            <p className="serif text-white">{dateStr}</p>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Safari Details</h5>
              <div className="flex items-center gap-3 text-sm text-gray-700"><Clock className="w-4 h-4 text-gray-400" /> {safariType?.title} ({safariDetails?.startTime} – {safariDetails?.endTime})</div>
              <div className="flex items-center gap-3 text-sm text-gray-700"><Users className="w-4 h-4 text-gray-400" /> {booking.visitors?.count} Visitors ({safariDetails?.totalJeeps} Jeep{safariDetails?.totalJeeps > 1 ? 's' : ''})</div>
              <div className="flex items-center gap-3 text-sm text-gray-700"><MapPin className="w-4 h-4 text-gray-400" /> Yala National Park, Entrance Gate 1</div>
            </div>
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Primary Driver</h5>
              <div className="flex items-center gap-3">
                <img src={driverDetails?.image} alt="" className="w-12 h-12 object-cover rounded" />
                <div>
                  <p className="font-medium text-gray-900">{driverDetails?.name}</p>
                  <p className="text-xs text-gray-400">{driverDetails?.vehicleType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center space-y-4 p-8 border border-dashed rounded-2xl" style={{ borderColor: GOLD, background: 'rgba(197,160,89,0.03)' }}>
            <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-md">
              <QRCodeSVG
                value={qrData}
                size={160}
                bgColor="#ffffff"
                fgColor="#1A1A1A"
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700">Digital Boarding Pass</p>
              <p className="text-[10px] text-gray-400">Show this QR code to your driver at the meeting point for check-in.</p>
            </div>
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border rounded-lg transition-all hover:shadow-md"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <Download className="w-3 h-3" /> Download QR Code
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-gray-100 flex flex-wrap gap-6 justify-center" style={{ background: 'rgba(197,160,89,0.05)' }}>
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <div className="w-[1px] h-8 bg-gray-200 self-center" />
          <button
            onClick={handleShareEmail}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Share2 className="w-4 h-4" /> Share via Email
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => window.location.reload()} className="px-10 py-4 border font-bold uppercase tracking-widest text-sm hover:text-white transition-all rounded-lg" style={{ borderColor: GOLD, color: GOLD }} onMouseEnter={e => { (e.target as HTMLElement).style.background = GOLD; (e.target as HTMLElement).style.color = 'white'; }} onMouseLeave={e => { (e.target as HTMLElement).style.background = ''; (e.target as HTMLElement).style.color = GOLD; }}>
          Book Another Safari
        </button>
      </div>
    </div>
  );
}
