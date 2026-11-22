import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { tripService, favoriteService, reviewService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Map,
  Sparkles,
  Calendar,
  Wallet,
  Heart,
  Star,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardHome() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tripsRes, favsRes, revsRes] = await Promise.all([
          tripService.getAll().catch(() => ({ data: { data: [] } })),
          favoriteService.getAll().catch(() => ({ data: { data: [] } })),
          reviewService.getMyReviews().catch(() => ({ data: { data: [] } })),
        ]);

        setTrips(tripsRes.data?.data || []);
        setFavorites(favsRes.data?.data || []);
        setReviews(revsRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your travel workspace..." />;

  const upcomingTrips = trips.filter(
    (t) => new Date(t.startDate) >= new Date() && t.status !== 'cancelled'
  );
  const totalBudgetPlanned = trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0);

  // Distribution chart data
  const chartData = [
    { name: 'Trips Planned', value: trips.length || 1, color: '#254d25' },
    { name: 'Favorites', value: favorites.length || 1, color: '#c1694f' },
    { name: 'Reviews', value: reviews.length || 1, color: '#3d7a3d' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="card p-8 bg-forest-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-300">
            Discerning Traveler Workspace
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-0.5">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            You have {upcomingTrips.length} upcoming travel itinerary journeys scheduled.
          </p>
        </div>

        <Link
          to="/dashboard/composer"
          className="btn-terracotta text-xs py-2.5 px-4 flex items-center space-x-1.5 flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Composer</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Trips</span>
            <Map className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold font-display text-charcoal">{trips.length}</div>
        </div>

        <div className="card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Upcoming</span>
            <Calendar className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold font-display text-forest-800">
            {upcomingTrips.length}
          </div>
        </div>

        <div className="card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Budget Allocated</span>
            <Wallet className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold font-display text-charcoal">
            ₹{totalBudgetPlanned.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Saved Spots</span>
            <Heart className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl font-bold font-display text-charcoal">{favorites.length}</div>
        </div>
      </div>

      {/* Main Grid: Upcoming Trips & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Upcoming Trips */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl font-bold text-charcoal">Upcoming Journeys</h2>
            <Link
              to="/dashboard/trips"
              className="text-xs font-semibold text-forest-800 hover:underline"
            >
              View All ({trips.length})
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="card p-8 text-center space-y-3">
              <Map className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">You haven't planned any trips yet.</p>
              <Link to="/dashboard/composer" className="btn-primary text-xs py-2 px-4 inline-block">
                Compose Your First Journey
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 3).map((trip) => (
                <div
                  key={trip._id}
                  className="card p-5 hover:border-gray-300 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                      {trip.status || 'planned'}
                    </span>
                    <h3 className="font-display text-lg font-bold text-charcoal">
                      <Link to={`/dashboard/trips/${trip._id}`} className="hover:text-forest-800">
                        {trip.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(trip.startDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      –{' '}
                      {new Date(trip.endDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      &bull; {trip.numberOfDays || 1} Days
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 sm:text-right">
                    <div className="text-xs">
                      <span className="text-gray-400 block text-[10px] uppercase">Budget</span>
                      <strong className="text-forest-900 font-bold">
                        ₹{trip.totalBudget?.toLocaleString('en-IN') || 0}
                      </strong>
                    </div>
                    <Link
                      to={`/dashboard/trips/${trip._id}`}
                      className="p-2 text-forest-800 hover:bg-forest-50 rounded"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Activity Breakdown Chart */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-charcoal">Travel Portfolio</h2>
          <div className="card p-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-2 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-800 mr-2"></span>
                  Trips Configured
                </span>
                <span className="font-semibold text-charcoal">{trips.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-terracotta mr-2"></span>
                  Favorite Spots
                </span>
                <span className="font-semibold text-charcoal">{favorites.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-600 mr-2"></span>
                  Reviews Published
                </span>
                <span className="font-semibold text-charcoal">{reviews.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
