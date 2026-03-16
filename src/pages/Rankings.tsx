import React, { useState, useMemo, useEffect } from 'react';
import { 
  Star, 
  Award, 
  Camera, 
  Binoculars, 
  Bird, 
  ChevronRight, 
  Filter,
  Search,
  Info,
  CheckCircle2,
  Crown,
  Medal,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

type DriverStatus = 'AVAILABLE' | 'ON_SAFARI' | 'AVAILABLE_LATER';

interface Driver {
  id: string;
  rank: number;
  name: string;
  profilePhoto: string;
  experienceYears: number;
  vehicleType: string;
  rating: number;
  totalSafaris: number;
  totalReviews: number;
  skills: string[];
  status: DriverStatus;
  nextAvailableTime?: string;
  reviewPreview: {
    text: string;
    author: string;
  };
}

// --- Components ---

const StatusBadge: React.FC<{ status: DriverStatus, nextAvailableTime?: string }> = ({ status, nextAvailableTime }) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Available Now
        </div>
      );
    case 'ON_SAFARI':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          On Safari {nextAvailableTime ? `– Available in ${nextAvailableTime}` : ''}
        </div>
      );
    case 'AVAILABLE_LATER':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Next available at {nextAvailableTime}
        </div>
      );
    default:
      return null;
  }
};

const SkillTag: React.FC<{ skill: string }> = ({ skill }) => {
  const getIcon = (s: string) => {
    if (s.includes('Photography')) return <Camera className="w-3 h-3" />;
    if (s.includes('Leopard')) return <Binoculars className="w-3 h-3" />;
    if (s.includes('Bird')) return <Bird className="w-3 h-3" />;
    return <Award className="w-3 h-3" />;
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1a2e1a]/5 text-[#1a2e1a] text-[10px] uppercase tracking-wider font-bold border border-[#1a2e1a]/10">
      {getIcon(skill)}
      {skill}
    </span>
  );
};

const RankBadge: React.FC<{ rank: number, isTop?: boolean }> = ({ rank, isTop }) => {
  if (rank > 3) {
    return (
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg bg-stone-900 text-white border border-stone-800 z-20">
        #{rank}
      </div>
    );
  }

  const config = {
    1: { 
      icon: <Crown className="w-5 h-5" />, 
      colors: 'from-[#D4AF37] via-[#F9E27D] to-[#D4AF37]', 
      label: 'Elite' 
    },
    2: { 
      icon: <Trophy className="w-4 h-4" />, 
      colors: 'from-[#C0C0C0] via-[#E8E8E8] to-[#C0C0C0]', 
      label: 'Pro' 
    },
    3: { 
      icon: <Medal className="w-4 h-4" />, 
      colors: 'from-[#CD7F32] via-[#E3A869] to-[#CD7F32]', 
      label: 'Expert' 
    },
  }[rank as 1 | 2 | 3];

  return (
    <div className="absolute -top-4 -left-4 z-20 group-hover:scale-110 transition-transform duration-500">
      <div className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-2xl bg-gradient-to-br ${config?.colors} border border-white/40 transform -rotate-12 group-hover:rotate-0 transition-all duration-500`}>
        <div className="text-[#1a2e1a] drop-shadow-sm">
          {config?.icon}
        </div>
        <span className="text-[7px] font-black uppercase tracking-tighter text-[#1a2e1a]/80 -mt-0.5">
          {config?.label}
        </span>
      </div>
      <div className="absolute -bottom-1 -right-1 bg-stone-900 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
        {rank}
      </div>
    </div>
  );
};

const DriverCard: React.FC<{ driver: Driver, isTop?: boolean }> = ({ driver, isTop }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-500 cursor-pointer ${isTop ? 'shadow-xl ring-1 ring-[#c5a059]/20' : 'shadow-sm hover:shadow-xl hover:ring-1 hover:ring-[#c5a059]/10'}`}
    >
      {isTop && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-30" />
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-4">
            <div className="relative">
              <img 
                src={driver.profilePhoto} 
                alt={driver.name}
                className={`w-16 h-16 rounded-2xl object-cover border-2 transition-all duration-500 ${isHovered ? 'scale-110 border-[#c5a059]' : 'border-stone-100'}`}
                referrerPolicy="no-referrer"
              />
              <RankBadge rank={driver.rank} isTop={isTop} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-serif font-bold text-[#1a2e1a] group-hover:text-[#c5a059] transition-colors leading-tight">{driver.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#c5a059] text-[#c5a059]" />
                  <span className="text-xs font-black text-[#1a2e1a]">{driver.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest">{driver.id}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <StatusBadge status={driver.status} nextAvailableTime={driver.nextAvailableTime} />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(driver.rating) ? 'fill-[#c5a059] text-[#c5a059]' : 'text-stone-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-stone-400 font-medium">({driver.totalReviews} reviews)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                    <p className="text-[9px] text-stone-400 uppercase font-black tracking-widest mb-1">Exp</p>
                    <p className="text-xs font-bold text-[#1a2e1a]">{driver.experienceYears}Y</p>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                    <p className="text-[9px] text-stone-400 uppercase font-black tracking-widest mb-1">Safaris</p>
                    <p className="text-xs font-bold text-[#1a2e1a]">{driver.totalSafaris}</p>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                    <p className="text-[9px] text-stone-400 uppercase font-black tracking-widest mb-1">Vehicle</p>
                    <p className="text-[10px] font-bold text-[#1a2e1a] leading-tight truncate px-1">{driver.vehicleType.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {driver.skills.map((skill: string) => <SkillTag key={skill} skill={skill} />)}
                </div>

                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100/50 relative">
                  <span className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black uppercase tracking-widest text-[#c5a059]">Guest Review</span>
                  <p className="text-xs italic text-stone-600 leading-relaxed">
                    "{driver.reviewPreview.text}"
                    <span className="block mt-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">— {driver.reviewPreview.author}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-stone-700 text-xs font-black uppercase tracking-widest hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95 cursor-pointer">
            Profile
          </button>
          <button className="flex-[1.5] px-4 py-3 rounded-xl bg-[#1a2e1a] text-white text-xs font-black uppercase tracking-widest hover:bg-[#2a4a2a] transition-all shadow-lg shadow-[#1a2e1a]/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
            Book Now
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Rankings() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'safaris' | 'availability'>('rating');
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mocking the data fetching for the UI
    const fetchDrivers = () => {
      const mockDrivers: Driver[] = [
        {
          id: 'D-1001',
          rank: 1,
          name: 'Kasun Perera',
          profilePhoto: 'https://picsum.photos/seed/driver1/200/200',
          experienceYears: 12,
          vehicleType: 'Toyota Land Cruiser 70 Series',
          rating: 4.9,
          totalSafaris: 1240,
          totalReviews: 850,
          skills: ['Leopard Tracking Expert', 'Photography Guide'],
          status: 'AVAILABLE',
          reviewPreview: { text: "Excellent guide, highly recommended for safari lovers.", author: "Verified Guest" }
        },
        {
          id: 'D-1002',
          rank: 2,
          name: 'Nimal Silva',
          profilePhoto: 'https://picsum.photos/seed/driver2/200/200',
          experienceYears: 10,
          vehicleType: 'Land Rover Defender',
          rating: 4.8,
          totalSafaris: 980,
          totalReviews: 620,
          skills: ['Bird Watching Specialist', 'Experienced Safari Guide'],
          status: 'ON_SAFARI',
          nextAvailableTime: '2 hours',
          reviewPreview: { text: "Extremely knowledgeable about the birds.", author: "Verified Guest" }
        },
        {
          id: 'D-1003',
          rank: 3,
          name: 'Aruna Jayawardena',
          profilePhoto: 'https://picsum.photos/seed/driver3/200/200',
          experienceYears: 15,
          vehicleType: 'Mitsubishi L200 Safari Edition',
          rating: 4.7,
          totalSafaris: 1560,
          totalReviews: 910,
          skills: ['Leopard Tracking Expert', 'Wildlife Photography Guide'],
          status: 'AVAILABLE',
          reviewPreview: { text: "Best tracking experience in Yala.", author: "Verified Guest" }
        },
        {
          id: 'D-1004',
          rank: 4,
          name: 'Saman Kumara',
          profilePhoto: 'https://picsum.photos/seed/driver4/200/200',
          experienceYears: 8,
          vehicleType: 'Toyota Hilux Revo',
          rating: 4.6,
          totalSafaris: 850,
          totalReviews: 450,
          skills: ['Bird Watching Specialist'],
          status: 'AVAILABLE_LATER',
          nextAvailableTime: 'Tomorrow 06:00 AM',
          reviewPreview: { text: "Great birding experience.", author: "Verified Guest" }
        }
      ];
      setDrivers(mockDrivers);
      setLoading(false);
    };

    // Simulate network delay
    setTimeout(fetchDrivers, 500);
  }, []);

  const sortedDrivers = useMemo(() => {
    let filtered = [...drivers];
    
    if (skillFilter) {
      filtered = filtered.filter(d => d.skills.includes(skillFilter));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.id.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'safaris') return b.totalSafaris - a.totalSafaris;
      if (sortBy === 'availability') {
        const order = { 'AVAILABLE': 0, 'AVAILABLE_LATER': 1, 'ON_SAFARI': 2 };
        return order[a.status] - order[b.status];
      }
      return 0;
    });
  }, [drivers, sortBy, skillFilter, searchQuery]);

  const topThree = sortedDrivers.slice(0, 3);
  const remainingDrivers = sortedDrivers.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Loading Yala Elite Circle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#1a2e1a] selection:bg-[#c5a059]/30">
      {/* Header Section */}
      <header className="relative bg-[#1a2e1a] text-white pt-32 pb-40 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://picsum.photos/seed/safari-texture/1200/1200')] opacity-5 mix-blend-overlay grayscale" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#c5a059] rounded-full blur-[160px] opacity-10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#c5a059] text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <div className="w-1 h-1 rounded-full bg-[#c5a059] animate-pulse" />
              Elite Guides Program
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-serif font-bold tracking-tight mb-8 leading-[0.9]"
            >
              The Yala <br />
              <span className="text-[#c5a059] italic">Elite Circle</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-stone-400 leading-relaxed max-w-2xl font-medium"
            >
              Discover the highest-rated safari drivers and guides in Yala National Park. Ranked by expertise, reliability, and guest satisfaction.
            </motion.p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-20 pb-32">
        {/* Filters Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-5 mb-16 border border-white/20 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Sort By</span>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 rounded-2xl border border-stone-100">
                <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-black text-[#1a2e1a] focus:outline-none cursor-pointer uppercase tracking-wider"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="safaris">Most Safaris</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Specialization</span>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 rounded-2xl border border-stone-100">
                <Award className="w-3.5 h-3.5 text-[#c5a059]" />
                <select 
                  value={skillFilter || ''}
                  onChange={(e) => setSkillFilter(e.target.value || null)}
                  className="bg-transparent text-xs font-black text-[#1a2e1a] focus:outline-none cursor-pointer uppercase tracking-wider"
                >
                  <option value="">All Guides</option>
                  <option value="Leopard Tracking Expert">Leopard Tracking</option>
                  <option value="Photography Guide">Photography</option>
                  <option value="Bird Watching Specialist">Bird Watching</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative flex-1 max-md:w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BY NAME OR ID..."
              className="w-full pl-12 pr-6 py-3.5 bg-stone-50 rounded-2xl border border-stone-100 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/10 focus:border-[#c5a059] transition-all text-[10px] font-black tracking-[0.2em] uppercase"
            />
          </div>
        </div>

        {/* Top Drivers Section */}
        <section className="mb-24">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-12 h-px bg-[#c5a059] mb-6" />
            <h2 className="text-4xl font-serif font-bold mb-3">Elite Performers</h2>
            <p className="text-stone-500 text-sm font-medium uppercase tracking-[0.2em]">The Top Three Ranked Guides</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {topThree.map((driver) => (
                <DriverCard key={driver.id} driver={driver} isTop />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* All Drivers List */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col">
              <h2 className="text-3xl font-serif font-bold">Verified Rankings</h2>
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Global Leaderboard</p>
            </div>
            <div className="h-px flex-1 bg-stone-200 mx-10 hidden md:block" />
            <div className="flex items-center gap-2 text-stone-400 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {drivers.length} Verified Guides
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {remainingDrivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Ranking Explanation Section */}
        <section className="bg-[#1a2e1a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 flex items-center justify-center">
                  <Info className="w-6 h-6 text-[#c5a059]" />
                </div>
                <h2 className="text-3xl font-bold">How we rank our guides</h2>
              </div>
              <p className="text-stone-400 mb-8 leading-relaxed">
                Our ranking system is designed to reward consistency, expertise, and most importantly, the satisfaction of our guests. We use a weighted algorithm to ensure transparency and trust.
              </p>
              
              <div className="space-y-4">
                {[
                  { label: 'Tourist Rating', weight: '40%', desc: 'Average score from verified guest reviews' },
                  { label: 'Safari Experience', weight: '30%', desc: 'Total number of successfully completed safaris' },
                  { label: 'Review Quality', weight: '20%', desc: 'Sentiment analysis of written feedback' },
                  { label: 'Years of Experience', weight: '10%', desc: 'Total professional tenure in Yala National Park' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-[#c5a059] w-16">{item.weight}</div>
                    <div>
                      <h4 className="font-bold text-sm">{item.label}</h4>
                      <p className="text-xs text-stone-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/yala-jeep/800/600" 
                  alt="Safari Jeep" 
                  className="rounded-2xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl text-[#1a2e1a] max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold">100% Verified</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Every driver on YALA360 undergoes a rigorous background check and vehicle inspection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
