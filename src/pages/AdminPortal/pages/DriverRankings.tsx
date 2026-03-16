import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award, Info, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../utils';

export default function DriverRankings() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data = await api.getRankings();
      setRankings(data.rankings);
    } catch (error) {
      console.error("Failed to fetch rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-safari-gold" />
              Driver Leaderboard
            </h2>
            <span className="text-xs text-slate-500">Updated: Today, 09:00 AM</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Driver</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rating</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Safaris</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safari-gold"></div>
                      </div>
                    </td>
                  </tr>
                ) : rankings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No rankings found.
                    </td>
                  </tr>
                ) : rankings.map((driver, index) => (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                        index === 0 ? "bg-safari-gold text-safari-dark" : 
                        index === 1 ? "bg-slate-200 text-slate-800" :
                        index === 2 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-safari-gold border border-slate-200">
                          {driver.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{driver.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-safari-gold fill-safari-gold" />
                        <span className="text-sm text-slate-900">{driver.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{driver.totalSafaris}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-safari-gold">{driver.rankingScore}</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-safari-gold" style={{ width: `${driver.rankingScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 border-l-4 border-safari-gold">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-safari-gold" />
            <h3 className="font-bold text-slate-900">Ranking Formula</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our proprietary ranking algorithm ensures the highest quality service for YALA360 guests.
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Customer Rating</span>
              <span className="text-xs font-bold text-safari-gold">40%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-safari-gold" style={{ width: '40%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Safari Completion Rate</span>
              <span className="text-xs font-bold text-safari-gold">30%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-safari-gold" style={{ width: '30%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Experience (Years)</span>
              <span className="text-xs font-bold text-safari-gold">20%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-safari-gold" style={{ width: '20%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Vehicle Quality Score</span>
              <span className="text-xs font-bold text-safari-gold">10%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-safari-gold" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top Performer Perks</h3>
          <ul className="space-y-3">
            {[
              'Priority Booking Assignment',
              'Premium Badge on Profile',
              'Higher Commission Rates',
              'Exclusive Safari Zones Access'
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-safari-gold"></div>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
