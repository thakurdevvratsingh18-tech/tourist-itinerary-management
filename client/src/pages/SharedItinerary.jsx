import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripService, itineraryService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { exportItineraryToPDF } from '../utils/pdfExport';
import { Compass, Calendar, Users, Wallet, Printer, MapPin } from 'lucide-react';

export default function SharedItinerary() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        const res = await tripService.getShared(token);
        if (res.data?.success) {
          const tripData = res.data.data;
          setTrip(tripData);

          // Fetch day itineraries
          if (tripData._id) {
            const itinRes = await itineraryService.getByTrip(tripData._id);
            if (itinRes.data?.success) {
              setItineraries(itinRes.data.data || []);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load shared trip:', err);
        setError('This shared itinerary link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTrip();
  }, [token]);

  if (loading) return <LoadingSpinner message="Loading shared itinerary..." />;
  if (error || !trip) return <ErrorMessage message={error || 'Itinerary not found'} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header Card */}
      <div className="card p-8 bg-white border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 border border-forest-200 px-2.5 py-0.5 rounded inline-block mb-2">
              Shared Itinerary Plan
            </span>
            <h1 className="font-display text-3xl font-bold text-charcoal">{trip.title}</h1>
            <p className="text-xs text-gray-500 mt-1">Curated by {trip.user?.name || 'Traveler'}</p>
          </div>

          <button
            onClick={() => exportItineraryToPDF(trip, itineraries)}
            className="btn-secondary text-xs flex items-center space-x-1.5 flex-shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-forest-700" />
            <span>Print / PDF</span>
          </button>
        </div>

        {trip.description && (
          <p className="text-xs text-gray-700 leading-relaxed font-light">{trip.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Duration</span>
            <strong className="text-charcoal font-semibold">{trip.numberOfDays || 1} Days</strong>
          </div>
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Travelers</span>
            <strong className="text-charcoal font-semibold">{trip.numberOfTravelers || 1} Persons</strong>
          </div>
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Transport</span>
            <strong className="text-charcoal font-semibold capitalize">{trip.transportMode || 'Mixed'}</strong>
          </div>
          <div className="p-2.5 bg-gray-50 rounded">
            <span className="text-gray-400 block text-[10px] uppercase">Budget</span>
            <strong className="text-forest-900 font-semibold">
              ₹{trip.totalBudget?.toLocaleString('en-IN') || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Day by Day Itinerary */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-charcoal">Daily Schedule</h2>

        {itineraries.length === 0 ? (
          <p className="text-xs text-gray-500">No scheduled activities for this trip.</p>
        ) : (
          itineraries.map((day) => (
            <div key={day._id} className="card p-6 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-display text-base font-bold text-forest-900">
                  Day {day.day}: {day.title || 'Day Plan'}
                </h3>
                {day.date && (
                  <span className="text-xs text-gray-400">
                    {new Date(day.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {day.notes && <p className="text-xs text-gray-500 italic">{day.notes}</p>}

              <div className="space-y-2 pt-1">
                {(day.activities || []).map((act, aIdx) => (
                  <div
                    key={act._id || aIdx}
                    className="flex items-start justify-between text-xs p-2.5 bg-gray-50/60 rounded border border-gray-100"
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
                        <span className="font-medium text-forest-900">₹{act.estimatedCost}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card p-6 bg-forest-900 text-white text-center space-y-3">
        <h3 className="font-display text-xl font-bold">Inspired by this journey?</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Create your own customized travel itinerary with our algorithmic route & budget optimizer.
        </p>
        <Link to="/register" className="btn-terracotta text-xs py-2 px-5 inline-block">
          Plan Your Own Trip Free
        </Link>
      </div>
    </div>
  );
}
