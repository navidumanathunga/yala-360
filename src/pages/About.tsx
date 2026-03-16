import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  MapPin,
  Clock,
  Eye,
  Feather,
  Shield,
  Mountain,
  Waves,
  ChevronDown,
} from 'lucide-react';

/* ── reusable reveal hook ── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: string;
  from?: 'bottom' | 'left' | 'right';
}> = ({ children, delay = '0ms', from = 'bottom' }) => {
  const { ref, visible } = useInView();
  const t = from === 'left' ? '-40px,0' : from === 'right' ? '40px,0' : '0,40px';
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : `translate(${t})`,
        transition: `opacity 0.85s ease ${delay}, transform 0.85s ease ${delay}`,
      }}
    >
      {children}
    </div>
  );
};

const GOLD = '#C5A059';

/* ─── Wildlife card ─── */
const WildCard = ({
  img, name, label, delay,
}: { img: string; name: string; label: string; delay: string }) => (
  <Reveal delay={delay}>
    <div className="group relative overflow-hidden cursor-default" style={{ height: 360 }}>
      <img
        src={img}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div
        className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[3px] transition-all duration-500"
        style={{ background: GOLD }}
      />
      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: GOLD }}>{label}</p>
        <h3 className="text-xl serif font-bold text-white">{name}</h3>
      </div>
    </div>
  </Reveal>
);

/* ─── Zone card ─── */
const ZoneCard = ({
  Icon, title, text, delay,
}: { Icon: React.ElementType; title: string; text: string; delay: string }) => (
  <Reveal delay={delay}>
    <div className="group bg-white border border-gold/20 p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className="w-12 h-12 flex items-center justify-center mb-6" style={{ background: '#F5F1E9' }}>
        <Icon size={22} strokeWidth={1.5} style={{ color: GOLD }} />
      </div>
      <h3 className="text-xl serif font-bold text-gray-900 mb-3 group-hover:text-gold transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 font-light leading-relaxed">{text}</p>
    </div>
  </Reveal>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const About: React.FC = () => (
  <div className="overflow-x-hidden">

    {/* ── 1. HERO ── */}
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1674556275189-e78fd6223e6d?auto=format&fit=crop&q=80&w=1920&h=1080"
        alt="Yala National Park"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

      <div className="relative z-10 text-center text-white px-6 max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.4em] font-bold mb-6" style={{ color: GOLD }}>
          The Jewel of the East
        </p>
        <h1
          className="text-6xl md:text-8xl lg:text-[96px] serif leading-none mb-8"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
        >
          Yala.<br />Untamed.
        </h1>
        <p className="text-lg md:text-xl font-light tracking-widest uppercase italic text-white/75 mb-12">
          979 km² of Sri Lanka's most extraordinary wilderness
        </p>
        <Link
          to="/booking"
          className="group inline-flex items-center gap-2 px-10 py-4 bg-gold text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-gold transition-all"
        >
          Plan Your Visit <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <ChevronDown size={20} className="text-white/60" />
      </div>
    </section>

    {/* ── 2. INTRO ── */}
    <section className="bg-beige py-28 px-6 lg:px-24 text-center">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
          About Yala National Park
        </p>
        <div className="w-12 h-[1px] mx-auto mb-8" style={{ background: GOLD }} />
        <h2 className="text-4xl md:text-5xl lg:text-6xl serif leading-tight text-gray-900 mb-8 max-w-3xl mx-auto">
          Where the Wild<br />Meets the Sacred
        </h2>
        <p className="text-gray-500 font-light leading-loose text-lg max-w-2xl mx-auto mb-6">
          Located on Sri Lanka's southeastern coast, Yala National Park is a breathtaking mosaic of
          semi-arid thorn scrub, lush monsoon forests, and glittering freshwater wetlands — home to
          the world's highest concentration of leopards and one of Asia's greatest wildlife spectacles.
        </p>
        <p className="text-gray-400 font-light leading-loose text-base max-w-xl mx-auto">
          First declared a wildlife sanctuary in 1900 and a national park in 1938, Yala carries over
          a century of conservation legacy. It is also home to ancient Buddhist ruins, adding a
          spiritual dimension unlike any other park in the world.
        </p>
      </Reveal>

      {/* quick facts row */}
      <Reveal delay="150ms">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-gold/20 mt-20 max-w-3xl mx-auto divide-x divide-gold/20">
          {[
            { val: '979', unit: 'km²', label: 'Total Area' },
            { val: '215+', unit: 'species', label: 'Birds Recorded' },
            { val: '44', unit: 'mammals', label: 'Mammal Species' },
            { val: '1938', unit: 'AD', label: 'Park Established' },
          ].map(({ val, unit, label }) => (
            <div key={label} className="py-8 px-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{val}</div>
              <div className="text-[9px] uppercase tracking-widest font-bold mt-1 mb-0.5" style={{ color: GOLD }}>{unit}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>

    {/* ── 3. LEOPARD — split ── */}
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Reveal from="left">
          <div className="h-[500px] lg:h-full min-h-[520px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1566708627877-859df13ae63e?auto=format&fit=crop&q=80&w=900&h=900"
              alt="Sri Lankan Leopard"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal from="right" delay="100ms">
          <div className="p-12 lg:p-20 flex flex-col justify-center bg-beige h-full">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
              The Apex Predator
            </p>
            <h2 className="text-3xl lg:text-4xl serif text-gray-900 mb-6 leading-snug">
              Spirit of the Leopard
            </h2>
            <div className="w-12 h-[1px] mb-8" style={{ background: GOLD }} />
            <p className="text-gray-500 font-light leading-loose mb-6">
              Yala is world-renowned for harboring the highest density of wild leopards on Earth.
              These magnificent, solitary predators move like shadows through the park's granite
              outcrops and dense thorn scrub, most visible at dawn and dusk.
            </p>
            <p className="text-gray-400 font-light leading-loose mb-10">
              Our crowd-tracking technology ensures your jeep arrives at the right zone at the
              right moment — maximizing your chances of a truly private leopard encounter,
              without disturbing the natural rhythm of these elusive cats.
            </p>
            <Link
              to="/booking"
              className="self-start group flex items-center gap-2 text-xs uppercase tracking-widest font-bold border-b pb-1 transition-colors"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              Book a Leopard Safari <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>

    {/* ── 4. WILDLIFE GRID ── */}
    <section className="bg-beige py-24 px-6 lg:px-24">
      <Reveal>
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>Biodiversity</p>
          <h2 className="text-4xl md:text-5xl serif text-gray-900 mb-4">Wildlife of Yala</h2>
          <p className="text-gray-400 font-light italic text-lg max-w-xl mx-auto">
            A staggering array of species share this ancient landscape.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-gold/10 max-w-6xl mx-auto">
        <WildCard img="https://images.unsplash.com/photo-1630315956721-b1cd928bd0d4?auto=format&fit=crop&q=80&w=600&h=700"   name="Sri Lankan Leopard"     label="Panthera pardus kotiya"  delay="0ms"   />
        <WildCard img="https://images.unsplash.com/photo-1719807633728-7ff13f7f2b61?auto=format&fit=crop&q=80&w=600&h=700"  name="Sri Lankan Elephant"    label="Elephas maximus maximus" delay="80ms"  />
        <WildCard img="https://images.unsplash.com/photo-1616128417743-c3a6992a65e7?auto=format&fit=crop&q=80&w=600&h=700" name="Leopard Cub"             label="Panthera pardus"        delay="160ms" />
        <WildCard img="https://images.unsplash.com/photo-1559038209-9bc3455c7612?auto=format&fit=crop&q=80&w=600&h=700"     name="Safari Jeep"      label="Yala Experience"    delay="0ms"   />
        <WildCard img="https://images.unsplash.com/photo-1717322277282-92d26fae790e?auto=format&fit=crop&q=80&w=600&h=700"   name="Indian Peafowl"        label="Pavo cristatus"          delay="80ms"  />
        <WildCard img="https://images.unsplash.com/photo-1569691105751-88df003de7a4?auto=format&fit=crop&q=80&w=600&h=700"    name="Leopard Resting"           label="Wild encounters"           delay="160ms" />
      </div>
    </section>

    {/* ── 5. CONSERVATION — split (reversed) ── */}
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Reveal from="left" delay="100ms">
          <div className="p-12 lg:p-20 flex flex-col justify-center bg-[#1A1A1A] text-white h-full">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
              Our Commitment
            </p>
            <h2 className="text-3xl lg:text-4xl serif mb-6 leading-snug">
              Legacy of Conservation
            </h2>
            <div className="w-12 h-[1px] mb-8" style={{ background: GOLD }} />
            <p className="text-white/60 font-light leading-loose mb-6">
              Designated a wildlife sanctuary in 1900 and a national park in 1938, Yala carries over
              a century of conservation legacy. YALA360 continues this mission by using technology
              to minimize ecological pressure and maximize individual visitor experiences.
            </p>
            <p className="text-white/50 font-light leading-loose mb-10">
              Our AI-driven crowd-density system routes safari jeeps away from congested zones,
              reducing animal stress and giving wildlife the space they need — while ensuring
              you enjoy a quieter, more authentic encounter with nature.
            </p>
            <ul className="space-y-3">
              {[
                'Real-time crowd density routing',
                'Low-impact safari scheduling',
                'Partner of Yala Conservation Fund',
                'Carbon-neutral jeep fleet initiative',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/60 font-light">
                  <Leaf size={14} strokeWidth={1.5} style={{ color: GOLD }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal from="right">
          <div className="h-[500px] lg:h-full min-h-[520px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1570463662416-7d8e39fc67e2?auto=format&fit=crop&q=80&w=900&h=900"
              alt="Conservation"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>

    {/* ── 6. SAFARI ZONES ── */}
    <section className="bg-beige py-28 px-6 lg:px-24">
      <Reveal>
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>The Park</p>
          <h2 className="text-4xl md:text-5xl serif text-gray-900 mb-4">Safari Zones & Landscapes</h2>
          <p className="text-gray-400 font-light italic text-lg max-w-xl mx-auto">
            Yala is divided into five blocks, each with its own character and wildlife populations.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-gold/10 max-w-5xl mx-auto">
        <ZoneCard Icon={Eye}      title="Block I — Core Zone"       text="The most visited block, offering the highest concentration of leopards, elephants, and water birds. Strict visitor limits apply to preserve the ecosystem."                   delay="0ms"   />
        <ZoneCard Icon={Mountain} title="Block II — Wilderness"     text="A vast, remote wilderness with fewer visitors. Home to large elephant herds and an incredible diversity of bird life across lagoons and scrub forests."            delay="80ms"  />
        <ZoneCard Icon={Waves}    title="Block III — Wetlands"      text="A landscape dominated by seasonal tanks and marshlands. Exceptional for birding, with painted storks, pelicans, and spoonbills gathering in their thousands." delay="160ms" />
        <ZoneCard Icon={Feather}  title="Kumana — Bird Sanctuary"   text="Adjacent to Yala, Kumana is a paradise for ornithologists. Over 255 bird species including rare migrants make this one of Asia's finest birding destinations."  delay="0ms"   />
        <ZoneCard Icon={Shield}   title="Sithulpawwa Rock Temple"   text="Within the park boundaries lies a 2,000-year-old Buddhist rock temple. A spiritual and historical landmark that adds a unique cultural layer to every safari."  delay="80ms"  />
        <ZoneCard Icon={MapPin}   title="Yala Lagoon & Coast"       text="Where the park meets the Indian Ocean. The coastal strip hosts nesting turtles, saltwater crocodiles, and sea eagles soaring above sapphire waters."            delay="160ms" />
      </div>
    </section>

    {/* ── 7. SAFARI CULTURE — split ── */}
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Reveal from="left">
          <div className="h-[480px] lg:h-full min-h-[480px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1743014118271-415197f9b0ef?auto=format&fit=crop&q=80&w=900&h=900"
              alt="Safari Culture"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal from="right" delay="100ms">
          <div className="p-12 lg:p-20 flex flex-col justify-center bg-beige h-full">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>
              The Experience
            </p>
            <h2 className="text-3xl lg:text-4xl serif text-gray-900 mb-6 leading-snug">
              The Art of the Safari
            </h2>
            <div className="w-12 h-[1px] mb-8" style={{ background: GOLD }} />
            <p className="text-gray-500 font-light leading-loose mb-6">
              The ritual of the safari is deeply ingrained in Sri Lankan heritage. From the moment
              the jeep rolls through the gate at 5:30 AM, a different world takes hold — the
              morning dew on ancient acacia trees, the hush that falls when an elephant approaches.
            </p>
            <p className="text-gray-400 font-light leading-loose mb-10">
              Our curated team of wildlife guides and expert drivers have spent decades learning
              Yala's language — the alarm calls, the pug marks in the sand, the subtle rustle
              before a leopard emerges. Their knowledge transforms a drive into a story.
            </p>
            <div className="flex gap-4">
              <Link
                to="/profile"
                className="group flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all"
              >
                Meet Our Experts <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/booking"
                className="group flex items-center gap-2 px-8 py-4 border font-bold uppercase tracking-widest text-xs hover:border-gold hover:text-gold transition-all"
                style={{ borderColor: GOLD, color: GOLD }}
              >
                Book Now
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* ── 8. BEST TIME TO VISIT ── */}
    <section className="bg-[#1A1A1A] text-white py-24 px-6 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4" style={{ color: GOLD }}>Plan Ahead</p>
            <h2 className="text-4xl md:text-5xl serif mb-4">Best Time to Visit Yala</h2>
            <p className="text-white/50 font-light italic text-lg">Every season tells a different story.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { Icon: Clock, season: 'Feb – Jun', label: 'Peak Season', desc: 'Water levels drop and wildlife concentrates around waterholes — the best time for leopard and elephant sightings. Dry, sunny conditions with minimal rain.' },
            { Icon: Leaf,  season: 'Jul – Sep', label: 'Shoulder Season', desc: 'Park partially closed for conservation. Block I typically closes in September — an important period for the ecosystem to regenerate.' },
            { Icon: Waves, season: 'Oct – Jan', label: 'Wet Season',  desc: 'The monsoon transforms Yala into a lush green sanctuary. Excellent for birding with migratory species arriving, and a dramatic landscape of mist and rain.' },
          ].map(({ Icon, season, label, desc }, i) => (
            <Reveal key={i} delay={`${i * 100}ms`}>
              <div className="p-10 text-center group hover:bg-white/5 transition-colors">
                <Icon size={28} strokeWidth={1} className="mx-auto mb-5" style={{ color: GOLD }} />
                <p className="text-2xl font-bold mb-1">{season}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: GOLD }}>{label}</p>
                <p className="text-sm text-white/50 font-light leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ── 9. CTA BANNER ── */}
    <section className="bg-beige py-24 px-6 text-center">
      <Reveal>
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-[1px] mx-auto mb-10" style={{ background: GOLD }} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-5" style={{ color: GOLD }}>Ready to Experience It?</p>
          <h2 className="text-4xl md:text-5xl serif text-gray-900 mb-6 leading-tight">
            Your Safari Awaits<br />in Yala's Wild Heart
          </h2>
          <p className="text-gray-500 font-light text-lg mb-12 max-w-lg mx-auto">
            Let YALA360 craft the perfect safari for you — with the right guide, the right zone,
            and the right moment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="group px-12 py-4 bg-gold text-white font-bold uppercase tracking-widest text-sm hover:bg-[#1A1A1A] transition-all flex items-center gap-2"
            >
              Book Your Safari <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/profile"
              className="px-12 py-4 border border-gray-300 text-gray-600 font-bold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition-all"
            >
              Meet Our Experts
            </Link>
          </div>
          <div className="w-16 h-[1px] mx-auto mt-10" style={{ background: GOLD }} />
        </div>
      </Reveal>
    </section>

  </div>
);

export default About;
