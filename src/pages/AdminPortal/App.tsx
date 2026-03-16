import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  MapPin, 
  TrendingUp, 
  Star, 
  QrCode, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils';
import Toast, { type ToastType } from './components/Toast';
import NotificationModal from './components/NotificationModal';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Drivers from './pages/Drivers';
import Guides from './pages/Guides';
import DriverRankings from './pages/DriverRankings';
import Reviews from './pages/Reviews';
import Notifications from './pages/Notifications';
import SystemSettings from './pages/SystemSettings';
import Gallery from './pages/Gallery';
import MapLocationManager from './pages/MapManagement/MapLocationManager';
import AnimalSightingsManager from './pages/MapManagement/AnimalSightingsManager';
import { Image as ImageIcon, Map as MapIcon, ChevronDown } from 'lucide-react';

import ConfirmationModal from './components/ConfirmationModal';

type Section = 
  | 'Dashboard' 
  | 'Bookings' 
  | 'Drivers' 
  | 'Guides' 
  | 'Driver Rankings' 
  | 'Crowd Density Monitor' 
  | 'Analytics' 
  | 'Reviews' 
  | 'Notifications' 
  | 'Gallery'
  | 'Animal Sightings'
  | 'Tourist Attractions'
  | 'Hotels'
  | 'Restaurants'
  | 'System Settings';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Bookings', icon: CalendarCheck },
  { name: 'Drivers', icon: Users },
  { name: 'Guides', icon: MapPin },
  { name: 'Driver Rankings', icon: Trophy },
  { 
    name: 'Map Management', 
    icon: MapIcon,
    subItems: [
      { name: 'Animal Sightings', icon: MapPin },
      { name: 'Tourist Attractions', icon: MapIcon },
      { name: 'Hotels', icon: MapIcon },
      { name: 'Restaurants', icon: MapIcon },
    ]
  },
  { name: 'Reviews', icon: Star },
  { name: 'Notifications', icon: Bell },
  { name: 'Gallery', icon: ImageIcon },
  { name: 'System Settings', icon: Settings },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Map Management']);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationInitialType, setNotificationInitialType] = useState<string | undefined>(undefined);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const handleDashboardAction = (action: string) => {
    if (action === 'Broadcast') {
      setNotificationInitialType('info');
      setActiveSection('Notifications');
    } else if (action === 'Emergency') {
      setNotificationInitialType('alert');
      setActiveSection('Notifications');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard': return (
        <Dashboard 
          onShowNotification={() => setIsNotificationModalOpen(true)} 
          showToast={showToast} 
          onAction={handleDashboardAction}
        />
      );
      case 'Bookings': return <Bookings showToast={showToast} />;
      case 'Drivers': return <Drivers showToast={showToast} />;
      case 'Guides': return <Guides showToast={showToast} />;
      case 'Driver Rankings': return <DriverRankings />;
      case 'Reviews': return <Reviews showToast={showToast} />;
      case 'Notifications': return <Notifications initialType={notificationInitialType} />;
      case 'Gallery': return <Gallery showToast={showToast} />;
      case 'Animal Sightings': return <AnimalSightingsManager showToast={showToast} />;
      case 'Tourist Attractions': return <MapLocationManager type="attraction" title="Tourist Attractions" showToast={showToast} />;
      case 'Hotels': return <MapLocationManager type="hotel" title="Hotels" showToast={showToast} />;
      case 'Restaurants': return <MapLocationManager type="restaurant" title="Restaurants" showToast={showToast} />;
      case 'System Settings': return <SystemSettings showToast={showToast} />;
      default: return (
        <Dashboard 
          onShowNotification={() => setIsNotificationModalOpen(true)} 
          showToast={showToast} 
          onAction={handleDashboardAction}
        />
      );
    }
  };

  return (
    <div className="flex h-full bg-safari-dark overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        className="relative z-20 flex flex-col bg-safari-card border-r border-slate-200 shadow-2xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-safari-gold flex items-center justify-center shadow-lg shadow-safari-gold/20">
            <TrendingUp className="text-safari-dark w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl gold-text tracking-tight"
            >
              YALA360
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const hasSubItems = 'subItems' in item;
            const isExpanded = expandedItems.includes(item.name);
            const isActive = activeSection === item.name || (hasSubItems && item.subItems?.some(s => s.name === activeSection));

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      setExpandedItems(prev => 
                        prev.includes(item.name) 
                          ? prev.filter(i => i !== item.name) 
                          : [...prev, item.name]
                      );
                    } else {
                      setActiveSection(item.name as Section);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                    (isActive && !hasSubItems)
                      ? "bg-safari-gold text-safari-dark shadow-lg shadow-safari-gold/20" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", (isActive && !hasSubItems) ? "text-safari-dark" : "text-slate-400 group-hover:text-slate-900")} />
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {isSidebarOpen && hasSubItems && (
                    <ChevronDown className={cn("ml-auto w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                  )}
                  {isSidebarOpen && !hasSubItems && activeSection === item.name && (
                    <motion.div layoutId="active-indicator" className="ml-auto">
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>

                {hasSubItems && isExpanded && isSidebarOpen && (
                  <div className="ml-9 space-y-1">
                    {item.subItems?.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() => setActiveSection(sub.name as Section)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                          activeSection === sub.name
                            ? "text-safari-gold font-bold"
                            : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          activeSection === sub.name ? "bg-safari-gold scale-125" : "bg-slate-300"
                        )} />
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{activeSection}</h1>
            <p className="text-slate-500 text-sm">Welcome back, Administrator</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-safari-gold rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Vimukthi U.</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-safari-green-light border border-slate-200 flex items-center justify-center">
                <Users className="w-5 h-5 text-safari-sand" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          showToast('Logging out...', 'info');
          setTimeout(() => window.location.reload(), 1000);
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out of the YALA360 Admin Portal?"
        confirmLabel="Logout"
        variant="danger"
      />
    </div>
  );
}
