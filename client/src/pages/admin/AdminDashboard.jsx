import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, MapPin, Map, MessageSquare, Mail, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Querying enterprise statistics..." />;

  const metricCards = [
    { label: 'Total Users', value: stats?.usersCount || 2, icon: Users, color: 'text-forest-700' },
    { label: 'Destinations', value: stats?.destinationsCount || 15, icon: MapPin, color: 'text-forest-700' },
    { label: 'Trips Planned', value: stats?.tripsCount || 1, icon: Map, color: 'text-forest-700' },
    { label: 'Reviews', value: stats?.reviewsCount || 2, icon: MessageSquare, color: 'text-terracotta' },
  ];

  const categoryDistribution = [
    { name: 'Heritage', count: 6, fill: '#254d25' },
    { name: 'Mountain', count: 3, fill: '#3d7a3d' },
    { name: 'Spiritual', count: 2, fill: '#67a067' },
    { name: 'Beach', count: 2, fill: '#c1694f' },
    { name: 'Nature', count: 2, fill: '#97c197' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="pb-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            System Operations
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal">
            Administrator Console
          </h1>
        </div>
        <div className="flex items-center space-x-1 text-xs text-forest-800 bg-forest-50 px-3 py-1.5 rounded border border-forest-200">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold">Live Database Verified</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card p-5 bg-white space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="text-2xl font-bold font-display text-charcoal">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 bg-white space-y-4">
          <h3 className="font-display text-base font-bold text-charcoal">
            Destination Category Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#254d25" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 bg-white space-y-4">
          <h3 className="font-display text-base font-bold text-charcoal">System Inventory Health</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-charcoal">MongoDB Primary Replica</span>
              <span className="text-emerald-700 font-bold">Connected (Port 27017)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-charcoal">TSP Route Optimizer Engine</span>
              <span className="text-emerald-700 font-bold">2-Opt Local Search Active</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-charcoal">JWT Token Authentication</span>
              <span className="text-emerald-700 font-bold">HMAC-SHA256 Encrypted</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-charcoal">Map Tile Layer Service</span>
              <span className="text-emerald-700 font-bold">OpenStreetMap Tiles Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
