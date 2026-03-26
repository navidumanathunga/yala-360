
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Calendar,
  Compass,
  Camera,
  MapPin,
  ChevronDown,
} from 'lucide-react';

/* ── tiny hook: element in viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── animated counter ── */
const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = end / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [visible, end]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── reveal wrapper ── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: string; from?: 'bottom' | 'left' | 'right' }> = ({
  children, delay = '0ms', from = 'bottom',
}) => {
  const { ref, visible } = useInView();
  const translate = from === 'left' ? '-40px,0' : from === 'right' ? '40px,0' : '0,40px';
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : `translate(${translate})`,
        transition: `opacity 0.8s ease ${delay}, transform 0.8s ease ${delay}`,
      }}
    >
      {children}
    </div>
  );
};

const GOLD = '#C5A059';

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════ */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* bg */}
        <img
          src="https://images.unsplash.com/photo-1566650576880-6740b03eaad1?auto=format&fit=crop&q=80&w=1920&h=1080"
          alt="Yala Wildlife"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* layered overlays */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        {/* content */}
        <div className="relative z-10 text-center text-white px-6 max-w-5xl">
          <p
            className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold mb-6"
            style={{ animationDelay: '0.2s' }}
          >
            Sri Lanka's Premier Safari Platform
          </p>
          <h1
            className="text-6xl md:text-8xl lg:text-[100px] serif leading-none mb-8"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
          >
            Wildly<br />Elegant.
          </h1>
          <p className="text-lg md:text-xl font-light tracking-widest uppercase italic text-white/80 mb-12">
            The Ultimate Luxury Safari Experience in Yala
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="group px-10 py-4 bg-gold text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-gold transition-all flex items-center gap-2"
            >
              Book Your Safari
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-10 py-4 border border-white/50 text-white font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all"
            >
              Explore Park
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDown size={20} className="text-white/60" />
        </div>
      </section>

      {/* ════════════════════════════════════════
          2. WELCOME SECTION
      ════════════════════════════════════════ */}
      <section className="bg-beige py-28 px-6 lg:px-24 text-center">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
            Welcome to Yala360
          </p>
          <div className="w-12 h-[1px] mx-auto mb-8" style={{ background: GOLD }} />
          <h2 className="text-4xl md:text-5xl lg:text-6xl serif leading-tight text-gray-900 mb-8 max-w-3xl mx-auto">
            Not Just a Safari.<br />An Experience.
          </h2>
          <p className="text-gray-500 font-light leading-loose text-lg max-w-2xl mx-auto mb-6">
            YALA360 is Sri Lanka's most sophisticated safari planning platform — fusing real-time crowd intelligence,
            expert guides, and luxury experiences to give you a private, uninterrupted connection with Yala's wild heart.
          </p>
          <p className="text-gray-400 font-light leading-loose text-base max-w-xl mx-auto">
            We believe the best safari is one where you hear only the wind and the wildlife —
            not the noise of a hundred other jeeps. Our platform makes that possible.
          </p>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════
          3. WHY YALA360 — split layout
      ════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* image */}
          <Reveal from="left">
            <div className="h-[500px] lg:h-full min-h-[500px] overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&q=80&w=900&h=700"
                alt="Safari Guide"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>
          </Reveal>

          {/* content */}
          <Reveal from="right" delay="150ms">
            <div className="p-12 lg:p-20 flex flex-col justify-center bg-beige h-full">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
                Why Choose Yala360?
              </p>
              <h2 className="text-3xl lg:text-4xl serif text-gray-900 mb-10 leading-snug">
                A Smarter Way to<br />Experience the Wild
              </h2>
              <ul className="space-y-5">
                {[
                  'AI-driven crowd-density tracking for an undisturbed safari zone',
                  'Curated selection of top-rated drivers & certified wildlife guides',
                  'Real-time sightings map with live wildlife location data',
                  'Seamless digital booking with instant confirmation',
                  'Dedicated 24/7 guest support throughout your journey',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: GOLD }} strokeWidth={1.5} />
                    <span className="text-gray-600 font-light leading-relaxed text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/booking"
                className="mt-12 self-start group flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all"
              >
                Book Your Safari <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. STATS BAR
      ════════════════════════════════════════ */}
      <section className="bg-[#1A1A1A] text-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
          {[
            { end: 1200, suffix: '+', label: 'Safaris Booked' },
            { end: 98, suffix: '%', label: 'Satisfaction Rate' },
            { end: 50, suffix: '+', label: 'Expert Guides' },
            { end: 5, suffix: '★', label: 'Average Rating' },
          ].map(({ end, suffix, label }, i) => (
            <Reveal key={i} delay={`${i * 100}ms`}>
              <div className="text-center py-8 px-4">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: GOLD }}>
                  <Counter end={end} suffix={suffix} />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. EXPLORE GRID (4 image cards)
      ════════════════════════════════════════ */}
      <section className="bg-beige py-24 px-6 lg:px-24">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>Discover</p>
            <h2 className="text-4xl md:text-5xl serif text-gray-900">Everything Yala Has to Offer</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gold/20">
          {[
            { title: 'Plan Your Visit', sub: 'Seamless smart booking', img: 'planvisit', link: '/booking', Icon: Calendar },
            { title: 'Explore Wildlife', sub: 'Real-time sightings map', img: 'wildlife1', link: '/map', Icon: Compass },
            { title: 'Hotels Nearby', sub: 'Curated luxury stays', img: 'hotel1', link: '/about', Icon: MapPin },
            { title: 'View Gallery', sub: 'Photos from our community', img: 'gallery1', link: '/gallery', Icon: Camera },
          ].map(({ title, sub, link, Icon }, i) => (
            <Reveal key={i} delay={`${(i % 2) * 100}ms`}>
              <Link
                to={link}
                className="group relative block overflow-hidden border border-gold/10"
                style={{ height: '320px' }}
              >
                <img
                  src={
                    i === 0 ? "https://images.unsplash.com/photo-1558791985-4241e4011215?auto=format&fit=crop&q=80&w=800&h=600" :
                      i === 1 ? "https://images.unsplash.com/photo-1496841733162-a88a250a275c?auto=format&fit=crop&q=80&w=800&h=600" :
                        i === 2 ? "https://images.unsplash.com/photo-1656314945854-3ed692d05500?auto=format&fit=crop&q=80&w=800&h=600" :
                          "https://images.unsplash.com/photo-1569691105751-88df003de7a4?auto=format&fit=crop&q=80&w=800&h=600"
                  }
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/65 transition-colors duration-500" />
                {/* gold bottom bar on hover */}
                <div
                  className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: GOLD }}
                />
                {/* content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                  <Icon size={28} className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1} style={{ color: GOLD }} />
                  <h3 className="text-2xl serif font-bold mb-2 tracking-wide">{title}</h3>
                  <p className="text-xs uppercase tracking-widest text-white/60 group-hover:text-gold transition-colors">{sub}</p>
                  <span className="mt-6 text-[10px] font-bold uppercase tracking-widest border border-white/30 group-hover:border-gold group-hover:text-gold text-white/70 px-4 py-2 transition-all">
                    Explore →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. YALA NATIONAL PARK ABOUT STRIP
      ════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal from="left">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-6" style={{ color: GOLD }}>The Destination</p>
                <h2 className="text-4xl md:text-5xl serif text-gray-900 leading-tight mb-8">
                  Yala National Park
                </h2>
                <p className="text-gray-500 font-light leading-loose mb-6">
                  Spanning over 979 km² across Sri Lanka's southeastern coast, Yala is the island's most-visited national
                  park and home to the world's highest density of leopards. Beyond leopards, it shelters elephants,
                  sloth bears, crocodiles, and over 215 bird species.
                </p>
                <p className="text-gray-400 font-light leading-loose mb-10">
                  Yala360 is your gateway to this extraordinary ecosystem — ensuring every visit is private,
                  sustainable, and profoundly memorable.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/about"
                    className="group flex items-center gap-2 text-xs uppercase tracking-widest font-bold border-b pb-1 transition-colors"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/map"
                    className="group flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-200 pb-1 hover:text-gold hover:border-gold transition-all"
                  >
                    View Map <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* stacked photos */}
            <Reveal from="right" delay="150ms">
              <div className="relative h-[440px]">
                <img
                  src="https://images.unsplash.com/photo-1674556275189-e78fd6223e6d?auto=format&fit=crop&q=80&w=700&h=500"
                  alt="Yala Park"
                  className="absolute top-0 left-0 w-4/5 h-4/5 object-cover shadow-xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1700745325266-4499ce4f71cc?auto=format&fit=crop&q=80&w=500&h=400"
                  alt="Yala Wildlife"
                  className="absolute bottom-0 right-0 w-3/5 h-3/5 object-cover shadow-xl border-4 border-white"
                />
                {/* gold badge */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 flex flex-col items-center justify-center text-white text-center"
                  style={{ background: GOLD }}
                >
                  <span className="text-xl font-bold">979</span>
                  <span className="text-[9px] uppercase tracking-wider leading-tight">km²<br />park</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          7. SIGNATURE SAFARI EXPERIENCES
      ════════════════════════════════════════ */}
      <section className="bg-beige py-28 px-6 lg:px-24">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
              Signature Experiences
            </p>
            <h2 className="text-4xl md:text-5xl serif text-gray-900 mb-4">Safari Experiences</h2>
            <p className="text-gray-400 font-light italic text-lg">Choose the journey that calls to you.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gold/20 max-w-5xl mx-auto">
          {[
            {
              title: 'Morning Safari',
              time: '5:30 AM – 10:00 AM',
              desc: 'Witness the golden sunrise over Yala with maximum wildlife activity. Leopards and elephants are most active at dawn — the perfect photographer\'s safari.',
              img: 'morningsafari',
              badge: 'Most Popular',
            },
            {
              title: 'Full Day Safari',
              time: '5:30 AM – 6:00 PM',
              desc: 'A complete immersive experience across multiple safari zones. Ideal for serious wildlife enthusiasts who want to leave nothing to chance.',
              img: 'fullday',
              badge: 'Best Value',
            },
            {
              title: 'Evening Safari',
              time: '2:30 PM – 6:30 PM',
              desc: 'The park transforms in the late afternoon light. Exceptional for bird watching, elephant herds, and a stunning Yala sunset to close your day.',
              img: 'eveningsafari',
              badge: 'Scenic Pick',
            },
          ].map(({ title, time, desc, badge }, i) => (
            <Reveal key={i} delay={`${i * 120}ms`}>
              <div className="group bg-white border border-gold/10 flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                {/* image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      i === 0 ? "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=700&h=400" :
                        i === 1 ? "https://images.unsplash.com/photo-1705936981595-dea87508ce84?auto=format&fit=crop&q=80&w=700&h=400" :
                          "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=700&h=400"
                    }
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <span
                    className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest text-white px-3 py-1"
                    style={{ background: GOLD }}
                  >
                    {badge}
                  </span>
                </div>
                {/* content */}
                <div className="p-8 flex flex-col flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: GOLD }}>{time}</p>
                  <h3 className="text-xl serif font-bold text-gray-900 mb-4 group-hover:text-gold transition-colors">{title}</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed flex-1">{desc}</p>
                  <Link
                    to="/booking"
                    className="mt-8 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-b pb-1 self-start transition-all group-hover:gap-3"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    Book This Safari <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay="300ms">
          <div className="text-center mt-12">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 px-10 py-4 border border-gold text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all"
              style={{ color: GOLD }}
            >
              View All Experiences <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════
          8. TESTIMONIAL STRIP
      ════════════════════════════════════════ */}
      <section className="bg-[#1A1A1A] text-white py-24 px-6 lg:px-24">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill={GOLD} stroke={GOLD} />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl lg:text-4xl serif italic text-white/80 leading-relaxed mb-10">
              "The most magical safari of our lives. We had Yala entirely to ourselves —
              three leopards, a tusker, and a sky full of stars. YALA360 made it possible."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: GOLD }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" alt="Eleanor H" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Eleanor H.</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40">London, United Kingdom</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════
          9. REVIEWS CTA BANNER
      ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-beige">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
              Our Community
            </p>
            <h2 className="text-4xl md:text-5xl serif text-gray-900 mb-6">
              Trusted by Safari Lovers Worldwide
            </h2>
            <p className="text-gray-500 font-light text-lg mb-12 max-w-xl mx-auto">
              Join over 1,200 travellers who have experienced the magic of Yala through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/reviews"
                className="group px-10 py-4 bg-gold text-white font-bold uppercase tracking-widest text-sm hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2"
              >
                Read Reviews <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/profile"
                className="px-10 py-4 border border-gray-300 text-gray-700 font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all"
              >
                Meet Our Experts
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
