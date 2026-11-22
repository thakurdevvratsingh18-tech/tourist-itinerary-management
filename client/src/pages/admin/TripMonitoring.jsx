import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Map, Calendar, Users, Wallet } from 'lucide-react';

export default function TripMonitoring() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripService
      .getAll()
      .then((res) => {
        if (res.data?.success) {
          setTrips(res.data.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Auditing trips across platform..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">System Trip Monitoring</h1>
        <p className="text-xs text-gray-500">
          Live monitoring of user-generated itineraries and route optimization requests.
        </p>
      </div>

      <div className="card overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
              <th className="py-3 px-4">Trip Title</th>
              <th className="py-3 px-4">Traveler</th>
              <th className="py-3 px-4">Dates & Duration</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Budget (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trips.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4 font-semibold text-charcoal">{t.title}</td>
                <td className="py-3 px-4 text-gray-600">{t.user?.name || 'Registered User'}</td>
                <td className="py-3 px-4 text-gray-500">
                  {new Date(t.startDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  ({t.numberOfDays || 1} Days)
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] uppercase font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {t.status || 'planned'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-bold text-forest-900">
                  ₹{t.totalBudget?.toLocaleString('en-IN') || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
