import React, { useEffect, useState } from 'react';
import { 
  CalendarCheck, 
  Users, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  Activity,
  UserCheck,
  UserPlus,
  QrCode,
  Bell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { cn } from '../utils';
import { ToastType } from '../components/Toast';

export default function Dashboard({ onShowNotification, showToast, onAction }: { onShowNotification: () => void; showToast: (msg: string, type?: ToastType) => void; onAction?: (action: string) => void }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [densityData, setDensityData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState('today');

  const handleQuickAction = (label: string) => {
    if (onAction) {
      onAction(label);
    } else {
      if (label === 'Broadcast') {
        onShowNotification();
      } else if (label === 'Emergency') {
        showToast('Emergency alert sent to all park rangers!', 'error');
      } else {
        showToast(`${label} action triggered`);
      }
    }
  };

  const fetchData = async (range: string = 'today', retries = 3) => {
    try {
      const [m, d, c] = await Promise.all([
        api.getDashboardMetrics(range),
        api.getCrowdDensity(),
        api.getBookingComparison()
      ]);
      setMetrics(m);
      setDensityData(d.densityData);
      setComparisonData(c.comparisonData);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      if (retries > 0) {
        console.log(`Retrying fetch... (${retries} attempts left)`);
        setTimeout(() => fetchData(range, retries - 1), 2000);
      } else {
        showToast("Failed to load dashboard data. Please refresh.", "error");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(revenueRange);
  }, [revenueRange]);

  const metricCards = [
    { 
      label: 'Bookings Today', 
      value: metrics?.totalBookingsToday || '0', 
      trend: '+12%', 
      isUp: true, 
      icon: CalendarCheck,
      description: 'Total confirmed safari reservations for the current date. Trend shows comparison with yesterday.'
    },
    { 
      label: 'Total Visitors Today', 
      value: metrics?.totalVisitorsToday || '0', 
      trend: '+8%', 
      isUp: true, 
      icon: Users,
      description: 'Combined headcount of all tourists across all bookings today. Trend shows comparison with yesterday.'
    },
    { 
      label: 'Active Safaris', 
      value: metrics?.activeSafaris || '0', 
      trend: '-2%', 
      isUp: false, 
      icon: Activity,
      description: 'Number of jeeps currently inside the park boundaries. Trend shows change from 1 hour ago.'
    },
    { 
      label: 'Drivers On Safari', 
      value: metrics?.driversOnSafari || '0', 
      trend: '+5%', 
      isUp: true, 
      icon: UserCheck,
      description: 'Drivers currently assigned to active safari sessions. Trend shows change from 1 hour ago.'
    },
    { 
      label: 'Drivers Available', 
      value: metrics?.driversAvailable || '0', 
      trend: '+3%', 
      isUp: true, 
      icon: UserPlus,
      description: 'Verified drivers ready for immediate dispatch. Trend shows change from 1 hour ago.'
    },
    { 
      label: 'Avg Park Density', 
      value: `${metrics?.averageParkDensity || 0}%`, 
      trend: '-4%', 
      isUp: false, 
      icon: MapPin,
      description: 'Current park occupancy relative to maximum capacity. Trend shows change from 1 hour ago.'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safari-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {/* Revenue Widget */}
        <div className="glass-card p-5 border-safari-gold/20 bg-safari-gold/5 col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-safari-gold text-safari-dark shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <select 
              value={revenueRange}
              onChange={(e) => setRevenueRange(e.target.value)}
              className="text-[10px] font-bold uppercase tracking-wider bg-white/50 border border-slate-200 rounded-md px-1 py-0.5 focus:outline-none focus:border-safari-gold"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight">Platform Revenue</h3>
          <p className="text-xl font-black text-slate-900 mt-1">
            LKR {(metrics?.revenue || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-2 italic">
            Based on {revenueRange === 'all' ? 'total' : revenueRange} platform fees
          </p>
        </div>

        {metricCards.map((metric) => (
          <div key={metric.label} className="glass-card p-5 hover:border-safari-gold/30 transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-slate-50 text-safari-gold group-hover:bg-safari-gold group-hover:text-safari-dark transition-colors border border-slate-100">
                <metric.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
                metric.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {metric.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.trend}
              </div>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight">{metric.label}</h3>
            <p className="text-xl font-black text-slate-900 mt-1">{metric.value}</p>
            
            {/* Tooltip on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-white/95 backdrop-blur-sm p-4 rounded-2xl flex flex-col justify-center border border-safari-gold/20 z-10">
              <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crowd Density Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Crowd Density Analytics</h2>
              <p className="text-sm text-slate-500">Last 7 days entry trends</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <div className="w-2 h-2 rounded-full bg-safari-gold"></div>
                Jeeps
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Tourists
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={densityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8f9fa' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a'
                  }}
                />
                <Bar dataKey="totalJeeps" name="Jeeps" fill="#b8860b" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="totalTourists" name="Tourists" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Success Comparison */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Adoption Success</h2>
              <p className="text-sm text-slate-500">YALA360 vs External Bookings</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonData}>
                <defs>
                  <linearGradient id="colorYala" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b8860b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="bookedThroughPlatform" 
                  name="YALA360 Bookings"
                  stroke="#b8860b" 
                  fillOpacity={1} 
                  fill="url(#colorYala)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="nonPlatformSafaris" 
                  name="External Entries"
                  stroke="#64748b" 
                  fillOpacity={1} 
                  fill="url(#colorExt)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Live Park Status</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-safari-green-light flex items-center justify-center border border-slate-100">
                    <MapPin className="w-6 h-6 text-safari-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Block {i} Entrance</h4>
                    <p className="text-sm text-slate-500">Current Wait Time: {i * 5} mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">Optimal</p>
                  <p className="text-xs text-slate-500">Updated 2m ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Broadcast', icon: Bell, color: 'bg-blue-500' },
              { label: 'Emergency', icon: Activity, color: 'bg-rose-500' },
            ].map((action) => (
              <button 
                key={action.label} 
                onClick={() => handleQuickAction(action.label)}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-safari-gold/30 transition-all gap-2 group"
              >
                <div className={cn("p-3 rounded-lg text-white group-hover:scale-110 transition-transform", action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-600">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
