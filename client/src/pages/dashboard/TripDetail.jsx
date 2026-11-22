import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripService, itineraryService, budgetService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { exportItineraryToPDF } from '../../utils/pdfExport';
import {
  Calendar,
  Users,
  Wallet,
  Compass,
  Printer,
  Share2,
  Trash2,
  Edit,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'budget'

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const [tripRes, itinRes, expRes] = await Promise.all([
        tripService.getOne(id),
        itineraryService.getByTrip(id),
        budgetService.getExpenses(id).catch(() => ({ data: { data: [] } })),
      ]);

      if (tripRes.data?.success) {
        setTrip(tripRes.data.data);
      }
      if (itinRes.data?.success) {
        setItineraries(itinRes.data.data || []);
      }
      setExpenses(expRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load trip details:', err);
      setError('Could not retrieve trip details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!trip) return;
    const shareUrl = `${window.location.origin}/share/${trip.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner message="Loading trip..." />;
  if (error || !trip) return <ErrorMessage message={error || 'Trip not found'} />;

  const totalSpent = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const remainingBudget = (trip.totalBudget || 0) - totalSpent;

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/dashboard/trips')}
          className="text-xs text-gray-500 hover:text-charcoal flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="btn-secondary text-xs flex items-center space-x-1 py-1.5 px-3"
          >
            <Share2 className="w-3.5 h-3.5 text-forest-700" />
            <span>Share Link</span>
          </button>
          <button
            onClick={() => exportItineraryToPDF(trip, itineraries)}
            className="btn-secondary text-xs flex items-center space-x-1 py-1.5 px-3"
          >
            <Printer className="w-3.5 h-3.5 text-forest-700" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="card p-6 md:p-8 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              {trip.status || 'planned'}
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal mt-1">
              {trip.title}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{trip.description}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase text-gray-400 block font-semibold">Budget</span>
            <span className="text-xl font-bold text-forest-900 font-display">
              ₹{trip.totalBudget?.toLocaleString('en-IN') || 0}
            </span>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Duration</span>
            <strong className="text-charcoal">{trip.numberOfDays || 1} Days</strong>
          </div>
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Travelers</span>
            <strong className="text-charcoal">{trip.numberOfTravelers || 1} Person(s)</strong>
          </div>
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Spent So Far</span>
            <strong className="text-charcoal">₹{totalSpent.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Balance</span>
            <strong className={remainingBudget >= 0 ? 'text-forest-900' : 'text-red-600'}>
              ₹{remainingBudget.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`pb-3 uppercase tracking-wider transition-colors ${
            activeTab === 'itinerary'
              ? 'border-b-2 border-forest-800 text-forest-800'
              : 'text-gray-500 hover:text-charcoal'
          }`}
        >
          Daily Itinerary ({itineraries.length} Days)
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`pb-3 uppercase tracking-wider transition-colors ${
            activeTab === 'budget'
              ? 'border-b-2 border-forest-800 text-forest-800'
              : 'text-gray-500 hover:text-charcoal'
          }`}
        >
          Budget & Expenses ({expenses.length})
        </button>
      </div>

      {/* Tab 1: Itinerary */}
      {activeTab === 'itinerary' && (
        <div className="space-y-4">
          {itineraries.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No scheduled daily plans yet.</p>
          ) : (
            itineraries.map((day) => (
              <div key={day._id} className="card p-6 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white bg-forest-800 px-2 py-0.5 rounded">
                      Day {day.day}
                    </span>
                    <h3 className="font-display text-base font-bold text-charcoal">
                      {day.title || 'Day Plan'}
                    </h3>
                  </div>
                  {day.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {day.notes && <p className="text-xs text-gray-500 italic">{day.notes}</p>}

                <div className="space-y-2">
                  {(day.activities || []).map((act, idx) => (
                    <div
                      key={act._id || idx}
                      className="flex items-start justify-between text-xs p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-semibold text-charcoal">{act.title}</span>
                        {act.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{act.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-gray-400 text-[11px] block">{act.startTime || ''}</span>
                        {act.estimatedCost > 0 && (
                          <span className="font-semibold text-forest-900">₹{act.estimatedCost}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Budget */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-display text-base font-bold text-charcoal mb-4">
              Expenses Recorded
            </h3>

            {expenses.length === 0 ? (
              <p className="text-xs text-gray-500">No recorded expenses for this trip yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase text-[10px]">
                    <th className="py-2">Item</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td className="py-2.5 font-medium text-charcoal">{exp.title}</td>
                      <td className="py-2.5 capitalize text-gray-500">{exp.category}</td>
                      <td className="py-2.5 text-gray-400">
                        {new Date(exp.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-forest-900">
                        ₹{exp.amount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
