
import React, { useState } from 'react';
import { MOCK_SIGHTINGS } from '../constants';
import { MapPin, Info, Coffee, Camera, X } from 'lucide-react';

const MapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sightings' | 'services' | 'attractions'>('sightings');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const services = [
    { id: 'v1', name: 'Leopard Den Lodge', desc: 'Luxury eco-lodging adjacent to Zone 1.', x: 15, y: 40, type: 'services' },
    { id: 'v2', name: 'Tusk & Trunk Cafe', desc: 'Authentic Sri Lankan breakfast for early starters.', x: 80, y: 20, type: 'services' },
  ];

  const attractions = [
    { id: 'a1', name: 'Sithulpawwa Rock Temple', desc: 'Ancient 2nd century BC Buddhist monastery.', x: 50, y: 55, type: 'attractions' },
    { id: 'a2', name: 'Magul Maha Viharaya', desc: 'Historical site with intricate stone carvings.', x: 30, y: 85, type: 'attractions' },
  ];

  const renderPins = () => {
    if (activeTab === 'sightings') {
      return MOCK_SIGHTINGS.map(s => (
        <button 
          key={s.id} 
          onClick={() => setSelectedPin(s)}
          style={{ left: `${s.coordinates.x}%`, top: `${s.coordinates.y}%` }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-red-600 hover:scale-125 transition-all p-1 bg-white/50 rounded-full"
        >
          <Camera size={20} />
        </button>
      ));
    }
    if (activeTab === 'services') {
      return services.map(s => (
        <button 
          key={s.id} 
          onClick={() => setSelectedPin(s)}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-blue-600 hover:scale-125 transition-all p-1 bg-white/50 rounded-full"
        >
          <Coffee size={20} />
        </button>
      ));
    }
    if (activeTab === 'attractions') {
      return attractions.map(s => (
        <button 
          key={s.id} 
          onClick={() => setSelectedPin(s)}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-gold hover:scale-125 transition-all p-1 bg-white/50 rounded-full"
        >
          <MapPin size={20} />
        </button>
      ));
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-24 bg-beige min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl serif">Interactive Wilderness</h1>
          <p className="text-gray-500 font-light italic">Explore Yala's heartbeat through real-time data and historical landmarks.</p>
        </div>

        {/* Map Container */}
        <div className="relative bg-white p-4 border border-gold/20 shadow-2xl rounded-sm overflow-hidden min-h-[600px]">
          {/* Mock Map Background (Abstract SVG/Image) */}
          <div className="absolute inset-0 bg-[#E8E2D8] opacity-50">
            <svg width="100%" height="100%" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 300C150 200 300 400 500 300C700 200 850 400 950 300" stroke="#C5A059" strokeWidth="2" strokeDasharray="10 10"/>
              <circle cx="200" cy="150" r="80" fill="#DCD3C1" />
              <circle cx="700" cy="450" r="120" fill="#DCD3C1" />
              <path d="M0 0H1000V600H0V0Z" fill="url(#pattern0)" fillOpacity="0.1"/>
              <defs>
                <pattern id="pattern0" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#C5A059" />
                </pattern>
              </defs>
            </svg>
          </div>

          {/* Interactive Pins */}
          {renderPins()}

          {/* Map Controls */}
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-col space-y-2 z-10 w-48 sm:w-auto">
            <button 
              onClick={() => setActiveTab('sightings')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'sightings' ? 'bg-gold text-white shadow-lg' : 'bg-white text-gray-500 hover:text-gold'}`}
            >
              Recent Sightings
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'services' ? 'bg-gold text-white shadow-lg' : 'bg-white text-gray-500 hover:text-gold'}`}
            >
              Hotels & Dining
            </button>
            <button 
              onClick={() => setActiveTab('attractions')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'attractions' ? 'bg-gold text-white shadow-lg' : 'bg-white text-gray-500 hover:text-gold'}`}
            >
              Attractions
            </button>
          </div>

          {/* Selected Info Panel */}
          {selectedPin && (
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-8 sm:w-80 bg-white shadow-2xl p-6 border-t-4 border-gold animate-slideInRight z-20">
              <button onClick={() => setSelectedPin(null)} className="absolute top-2 right-2 text-gray-400 hover:text-black">
                <X size={16} />
              </button>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gold">
                  <Info size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Selected Detail</span>
                </div>
                <h3 className="text-xl serif">{String(selectedPin.animal || selectedPin.name)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {selectedPin.desc ? String(selectedPin.desc) : `Last spotted at ${String(selectedPin.time)} near ${String(selectedPin.location)}. This zone is currently showing moderate activity.`}
                </p>
                <button className="w-full py-2 bg-beige text-gold text-xs font-bold uppercase tracking-widest border border-gold/20 hover:bg-gold hover:text-white transition-all">
                  Navigate To
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
