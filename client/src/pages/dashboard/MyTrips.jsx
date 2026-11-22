import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Map, Plus, Calendar, Users, Wallet, ArrowRight, Trash2, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await tripService.getAll();
      if (res.data?.success) {
        setTrips(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      const res = await tripService.delete(id);
      if (res.data?.success) {
        toast.success('Trip deleted successfully.');
        setTrips(trips.filter((t) => t._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete trip.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your journeys..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">My Travel Trips</h1>
          <p className="text-xs text-gray-500">
            Manage your custom itineraries, schedules, and expense budgets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/dashboard/trips/new" className="btn-secondary text-xs flex items-center space-x-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Blank Trip</span>
          </Link>
          <Link to="/dashboard/composer" className="btn-primary text-xs flex items-center space-x-1.5">
            <span>Smart Composer</span>
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          title="No Trips Found"
          description="You haven't scheduled any travel trips yet. Use the Smart Composer to build an optimized itinerary in seconds."
          actionLabel="Launch Smart Composer"
          onAction={() => (window.location.href = '/dashboard/composer')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="card p-5 hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {trip.status || 'planned'}
                  </span>
                  <button
                    onClick={(e) => handleDelete(trip._id, e)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display text-lg font-bold text-charcoal line-clamp-1">
                  <Link to={`/dashboard/trips/${trip._id}`} className="hover:text-forest-800">
                    {trip.title}
                  </Link>
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {trip.description || 'Custom itinerary plan.'}
                </p>

                <div className="pt-2 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-forest-700" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      –{' '}
                      {new Date(trip.endDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      ({trip.numberOfDays || 1} Days)
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-forest-700" />
                    <span>{trip.numberOfTravelers || 1} Person(s)</span>
                  </div>

                  <div className="flex items-center">
                    <Wallet className="w-3.5 h-3.5 mr-1.5 text-forest-700" />
                    <span>₹{trip.totalBudget?.toLocaleString('en-IN') || 0} Estimated</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <Link
                  to={`/dashboard/trips/${trip._id}`}
                  className="font-semibold text-forest-800 hover:text-forest-950 flex items-center"
                >
                  <span>Manage Details</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>

                <Link
                  to={`/share/${trip.shareToken}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-600 flex items-center"
                  title="View Public Share Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
