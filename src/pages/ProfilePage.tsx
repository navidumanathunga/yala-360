import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Languages,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Binoculars,
  Trophy,
  Info,
  Award,
  MessageSquare,
  Edit3,
  BarChart3,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

// ---- Types ----
type Role = 'Driver' | 'Guide';
type Status = 'Available' | 'On Safari' | 'Booked Today' | 'Offline';

interface JeepInfo {
  model: string;
  capacity: number;
  features: string[];
  comfortRating: number;
  photoUrl: string;
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  message: string;
  date: string;
}

interface Profile {
  id: string;
  name: string;
  role: Role;
  photoUrl: string;
  rating: number;
  reviewCount: number;
  status: Status;
  availabilityNote: string;
  experienceYears: number;
  totalSafaris: number;
  languages: string[];
  specializations?: string[];
  jeep?: JeepInfo;
  stats: { averageRating: number; repeatTourists: number };
  ratingBreakdown: { [key: number]: number };
  reviews: Review[];
}

// ---- Mock Data ----
const mockDriver: Profile = {
  id: 'd1',
  name: 'Anura Perera',
  role: 'Driver',
  photoUrl: 'https://picsum.photos/seed/driver1/400/400',
  rating: 4.9,
  reviewCount: 124,
  status: 'Available',
  availabilityNote: 'Available Now',
  experienceYears: 12,
  totalSafaris: 850,
  languages: ['English', 'Sinhala', 'Tamil'],
  jeep: {
    model: 'Toyota Land Cruiser 70 Series',
    capacity: 6,
    features: ['Open Roof Safari Jeep', 'Photography Support Bars', 'Safety Rails', 'Cooler Box'],
    comfortRating: 4.8,
    photoUrl: 'https://picsum.photos/seed/jeep1/600/400',
  },
  stats: { averageRating: 4.9, repeatTourists: 45 },
  ratingBreakdown: { 5: 85, 4: 10, 3: 5, 2: 0, 1: 0 },
  reviews: [
    { id: 'r1', reviewerName: 'James Wilson', rating: 5, message: 'Anura is an incredible driver. He knows the park like the back of his hand. We saw three leopards in one morning!', date: 'March 2026' },
    { id: 'r2', reviewerName: 'Sarah Miller', rating: 5, message: 'Very professional and the jeep was extremely comfortable. Highly recommend for photography enthusiasts.', date: 'February 2026' },
  ],
};

const mockGuide: Profile = {
  id: 'g1',
  name: 'Kasun Jayawardena',
  role: 'Guide',
  photoUrl: 'https://picsum.photos/seed/guide1/400/400',
  rating: 5.0,
  reviewCount: 89,
  status: 'On Safari',
  availabilityNote: 'Currently On Safari — Available at 11:30 AM',
  experienceYears: 8,
  totalSafaris: 420,
  languages: ['English', 'German', 'Sinhala'],
  specializations: ['Leopard Tracking', 'Bird Watching', 'Photography Guidance', 'Wildlife Education'],
  stats: { averageRating: 5.0, repeatTourists: 32 },
  ratingBreakdown: { 5: 95, 4: 5, 3: 0, 2: 0, 1: 0 },
  reviews: [
    { id: 'r3', reviewerName: 'Elena Schmidt', rating: 5, message: 'Kasun is more than a guide; he is a wildlife encyclopedia. His bird tracking skills are unmatched.', date: 'January 2026' },
    { id: 'r4', reviewerName: 'Tom Bridges', rating: 5, message: 'The best guide we have ever had. He spotted a rare fishing cat and three leopards. Extraordinary knowledge.', date: 'February 2026' },
  ],
};

const allProfiles: Profile[] = [
  mockDriver,
  { ...mockDriver, id: 'd2', name: 'Sunil Dharmasena', photoUrl: 'https://picsum.photos/seed/driver2/400/400', rating: 4.7, reviewCount: 92, status: 'Booked Today', availabilityNote: 'Booked Today — Available Tomorrow', experienceYears: 15, totalSafaris: 1200, jeep: { ...mockDriver.jeep!, model: 'Mahindra Thar Safari Edition', photoUrl: 'https://picsum.photos/seed/jeep2/600/400' } },
  { ...mockDriver, id: 'd3', name: 'Rohan Silva', photoUrl: 'https://picsum.photos/seed/driver3/400/400', rating: 4.8, reviewCount: 156, status: 'Available', availabilityNote: 'Available Now', experienceYears: 10, totalSafaris: 720 },
  mockGuide,
  { ...mockGuide, id: 'g2', name: 'Nimal Perera', photoUrl: 'https://picsum.photos/seed/guide2/400/400', rating: 4.9, reviewCount: 64, status: 'Offline', availabilityNote: 'Offline — Returns Monday', experienceYears: 5, totalSafaris: 210, specializations: ['Elephant Behavior', 'Cultural Tours'] },
];

// ---- Status helpers ----
const STATUS_CONFIG: Record<Status, { dot: string; label: string; bg: string; text: string }> = {
  Available:     { dot: '#10B981', label: 'Available',     bg: 'bg-green-50',  text: 'text-green-700' },
  'On Safari':   { dot: '#F59E0B', label: 'On Safari',     bg: 'bg-amber-50',  text: 'text-amber-700' },
  'Booked Today':{ dot: '#3B82F6', label: 'Booked Today',  bg: 'bg-blue-50',   text: 'text-blue-700'  },
  Offline:       { dot: '#6B7280', label: 'Offline',        bg: 'bg-gray-100',  text: 'text-gray-500'  },
};

const StatusPill = ({ status }: { status: Status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

// ---- Star display ----
const StarRow = ({ rating, count }: { rating: number; count?: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={15} fill={i < Math.floor(rating) ? '#C5A059' : 'none'} stroke={i < Math.floor(rating) ? '#C5A059' : '#D1D5DB'} strokeWidth={1.5} />
    ))}
    <span className="ml-1 text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
    {count !== undefined && <span className="text-sm text-gray-400 font-light">({count})</span>}
  </div>
);

// ---- Animated counter ----
const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = value / (1200 / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <>{display}</>;
};

// ========== PROFILE DETAIL VIEW ==========
const ProfileDetail = ({ profile, onBack }: { profile: Profile; onBack: () => void }) => (
  <div className="pt-28 pb-24 px-6 lg:px-24 bg-beige min-h-screen">
    <div className="max-w-5xl mx-auto space-y-12">

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gold transition-colors"
      >
        <ChevronLeft size={16} /> Back to Experts
      </button>

      {/* ---- Hero ---- */}
      <section className="bg-[#1A1A1A] text-white overflow-hidden">
        {/* Top banner image strip */}
        <div className="h-48 overflow-hidden relative">
          <img
            src={`https://picsum.photos/seed/${profile.id}hero/1200/300`}
            alt=""
            className="w-full h-full object-cover brightness-50"
          />
          {/* role badge */}
          <span className="absolute bottom-6 left-8 text-[10px] font-bold uppercase tracking-widest bg-gold text-white px-4 py-1.5">
            {profile.role}
          </span>
        </div>

        <div className="p-8 lg:p-12 flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="-mt-20 shrink-0 relative">
            <img
              src={profile.photoUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-36 h-36 rounded-full border-4 border-gold object-cover shadow-2xl"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <StatusPill status={profile.status} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-0">
            <h1 className="text-4xl md:text-5xl serif font-bold mb-3">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <StarRow rating={profile.rating} count={profile.reviewCount} />
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1.5 text-sm text-white/60">
                <MapPin size={14} /> Yala National Park
              </span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-0 border border-white/10 divide-x divide-white/10 mb-8 max-w-lg">
              {[
                { Icon: Trophy,    label: 'Experience', val: `${profile.experienceYears} Yrs` },
                { Icon: Binoculars,label: 'Safaris',    val: `${profile.totalSafaris}+` },
                { Icon: Languages, label: 'Languages',  val: profile.languages.slice(0,2).join(' · ') },
              ].map(({ Icon, label, val }) => (
                <div key={label} className="px-6 py-4 text-center">
                  <Icon size={18} className="text-gold mx-auto mb-1" strokeWidth={1.5} />
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">{label}</div>
                  <div className="text-sm font-bold">{val}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert(`Booking request sent for ${profile.name}`)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-gold transition-all"
            >
              Select This {profile.role} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ---- Body grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===== LEFT (lg:col-span-2) ===== */}
        <div className="lg:col-span-2 space-y-8">

          {/* Availability */}
          <section className="bg-white border border-gold/20 p-8">
            <h2 className="text-2xl serif font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-gold" strokeWidth={1.5} />
              Real-time Availability
            </h2>
            <div className="flex items-start gap-4 bg-beige border border-gold/10 p-5">
              <Info size={18} className="text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                {profile.availabilityNote}. {profile.status === 'Available'
                  ? 'You can book this expert for your next safari immediately.'
                  : 'You can book them for future dates or inquire for the next available slot.'}
              </p>
            </div>
          </section>

          {/* Jeep (Driver) */}
          {profile.role === 'Driver' && profile.jeep && (
            <section className="bg-white border border-gold/20 p-8">
              <h2 className="text-2xl serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-gold" strokeWidth={1.5} />
                Safari Jeep Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="overflow-hidden">
                  <img src={profile.jeep.photoUrl} alt={profile.jeep.model} className="w-full h-52 object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl serif font-bold text-gray-900">{profile.jeep.model}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} className="text-gold" strokeWidth={1.5} />
                    Capacity: {profile.jeep.capacity} Passengers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.jeep.features.map((f, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-widest bg-beige border border-gold/20 text-gray-700 px-3 py-1">{f}</span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gold/10">
                    <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2">Comfort Rating</p>
                    <StarRow rating={profile.jeep.comfortRating} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Specializations (Guide) */}
          {profile.role === 'Guide' && profile.specializations && (
            <section className="bg-white border border-gold/20 p-8">
              <h2 className="text-2xl serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award size={20} className="text-gold" strokeWidth={1.5} />
                Guide Specializations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.specializations.map((spec, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-beige border border-gold/10">
                    <CheckCircle2 size={16} className="text-gold shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-gray-800">{spec}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="bg-white border border-gold/20 p-8">
            <div className="flex items-center justify-between mb-8 border-b border-gold/10 pb-6">
              <h2 className="text-2xl serif font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare size={20} className="text-gold" strokeWidth={1.5} />
                Guest Reviews
              </h2>
              <button className="group flex items-center gap-2 px-5 py-2.5 border border-gold text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all">
                <Edit3 size={14} className="group-hover:rotate-12 transition-transform" />
                Write a Review
              </button>
            </div>

            <div className="space-y-8">
              {profile.reviews.map((review) => (
                <div key={review.id} className="group bg-beige border border-gold/10 p-6 relative hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div>
                      <h4 className="serif font-bold text-gray-900 text-lg">{review.reviewerName}</h4>
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{review.date}</span>
                    </div>
                    <div className="flex text-gold bg-gold/5 px-2 py-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? '#C5A059' : 'none'} stroke={i < review.rating ? '#C5A059' : '#D1D5DB'} strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 font-light italic leading-relaxed">"{review.message}"</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 border border-gold/20 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-all">
              Load More Reviews
            </button>
          </section>
        </div>

        {/* ===== RIGHT sidebar ===== */}
        <div className="space-y-6">

          {/* Stat cards */}
          {[
            { Icon: Star,       label: 'Avg Rating',  value: profile.rating,            suffix: '' },
            { Icon: Binoculars, label: 'Safaris Done', value: profile.totalSafaris,      suffix: '+' },
            { Icon: Calendar,   label: 'Years Active', value: profile.experienceYears,   suffix: '' },
          ].map(({ Icon, label, value, suffix }) => (
            <div key={label} className="bg-white border border-gold/20 p-6 flex items-center gap-5 group hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-beige flex items-center justify-center flex-shrink-0">
                <Icon size={22} className="text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  <AnimatedNumber value={typeof value === 'number' ? Math.round(value * 10) / 10 : value} />{suffix}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">{label}</div>
              </div>
            </div>
          ))}

          {/* Rating breakdown */}
          <div className="bg-white border border-gold/20 p-6">
            <h3 className="text-lg serif font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart3 size={16} className="text-gold" strokeWidth={1.5} />
              Rating Breakdown
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-4 text-right">{star}</span>
                  <Star size={11} fill="#C5A059" stroke="#C5A059" />
                  <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-1000"
                      style={{ width: `${profile.ratingBreakdown[star] ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{profile.ratingBreakdown[star] ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Repeat tourists */}
          <div className="bg-[#1A1A1A] text-white p-6">
            <Users size={24} className="text-gold mb-3" strokeWidth={1} />
            <div className="text-3xl font-bold mb-1">{profile.stats.repeatTourists}%</div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Repeat Tourists</p>
            <p className="text-xs text-white/40 font-light mt-2 leading-relaxed">
              Guests who have booked this {profile.role.toLowerCase()} more than once.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ========== LISTING CARD ==========
const ProfileCard = ({ profile, onClick }: { profile: Profile; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group bg-white border border-transparent hover:border-gold hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={profile.photoUrl}
        alt={profile.name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute top-4 right-4">
        <StatusPill status={profile.status} />
      </div>
      <span className="absolute bottom-4 left-4 text-[9px] font-bold uppercase tracking-widest bg-gold text-white px-3 py-1">
        {profile.role}
      </span>
    </div>
    <div className="p-8 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-2xl serif font-bold text-gray-900 group-hover:text-gold transition-colors">{profile.name}</h3>
        <StarRow rating={profile.rating} />
      </div>
      <p className="text-sm font-light text-gray-500 leading-relaxed mb-6 flex-1">
        {profile.experienceYears} years of experience · {profile.totalSafaris}+ safaris completed in Yala National Park.
      </p>
      <div className="flex items-center justify-between pt-5 border-t border-gold/10">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-widest">
          <Languages size={12} className="text-gold" />
          {profile.languages.slice(0, 2).join(' · ')}
        </div>
        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gold group-hover:gap-2 transition-all">
          View Profile <ArrowRight size={14} />
        </span>
      </div>
    </div>
  </div>
);

// ========== MAIN PAGE ==========
const ProfilePage: React.FC = () => {
  const [filter, setFilter] = useState<Role | 'All'>('All');
  const [selected, setSelected] = useState<Profile | null>(null);

  const filtered = filter === 'All' ? allProfiles : allProfiles.filter((p) => p.role === filter);

  if (selected) {
    return (
      <ProfileDetail
        profile={selected}
        onBack={() => { setSelected(null); window.scrollTo(0, 0); }}
      />
    );
  }

  return (
    <div className="pt-28 pb-24 bg-beige min-h-screen">

      {/* Page header */}
      <header className="px-6 lg:px-24 max-w-5xl mx-auto mb-16 border-b border-gold/20 pb-12">
        <span className="text-gold font-bold uppercase tracking-widest text-xs">Our Team</span>
        <h1 className="text-5xl md:text-6xl serif mt-3 mb-4 text-gray-900">Safari Experts</h1>
        <p className="text-gray-500 font-light italic text-lg max-w-xl">
          Hand-picked drivers and wildlife guides with unmatched expertise in Yala National Park.
        </p>
      </header>

      <div className="px-6 lg:px-24 max-w-5xl mx-auto">

        {/* Filter tabs */}
        <div className="flex items-center gap-3 mb-10">
          {(['All', 'Driver', 'Guide'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                filter === role
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gold hover:text-gold'
              }`}
            >
              {role === 'All' ? 'All Experts' : `${role}s`}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-gold/10">
          {filtered.map((profile) => (
            <div key={profile.id} className="border border-gold/10">
              <ProfileCard
                profile={profile}
                onClick={() => { setSelected(profile); window.scrollTo(0, 0); }}
              />
            </div>
          ))}
        </div>

        {/* Divider quote */}
        <div className="mt-20 py-16 border-t border-gold/20 text-center max-w-2xl mx-auto">
          <div className="w-16 h-[1px] bg-gold mx-auto mb-8" />
          <p className="text-2xl md:text-3xl serif italic text-gray-500 leading-relaxed">
            "Every expert on our platform has been personally vetted for skill, safety, and passion."
          </p>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-8" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
