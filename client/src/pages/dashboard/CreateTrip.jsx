import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService, destinationService } from '../../services/api';
import { Map, Calendar, Users, Wallet, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { TRANSPORT_MODES } from '../../utils/constants';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDestId, setSelectedDestId] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [totalBudget, setTotalBudget] = useState(30000);
  const [transportMode, setTransportMode] = useState('train');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    destinationService.getAll().then((res) => {
      if (res.data?.success) {
        setDestinations(res.data.data || []);
        if (res.data.data?.length > 0) {
          setSelectedDestId(res.data.data[0]._id);
        }
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a trip title.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await tripService.create({
        title,
        description,
        destinations: selectedDestId ? [selectedDestId] : [],
        startDate,
        endDate,
        numberOfTravelers,
        totalBudget,
        transportMode,
        travelStyle: 'solo',
      });

      if (res.data?.success) {
        toast.success('Trip created successfully!');
        navigate(`/dashboard/trips/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/dashboard/trips')}
          className="text-gray-500 hover:text-charcoal p-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-charcoal">Create New Travel Trip</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5 bg-white">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Trip Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Royal Rajasthan Weekend Getaway"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Trip Notes / Description
          </label>
          <textarea
            rows="3"
            placeholder="Add trip objectives, companion details, or packing notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Destination</label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="select-field text-xs"
            >
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Travelers</label>
            <input
              type="number"
              min="1"
              value={numberOfTravelers}
              onChange={(e) => setNumberOfTravelers(parseInt(e.target.value, 10))}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Budget (INR)</label>
            <input
              type="number"
              step="1000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseInt(e.target.value, 10))}
              className="input-field text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Transport Mode</label>
          <select
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            className="select-field text-xs"
          >
            {TRANSPORT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/trips')}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary text-xs">
            {submitting ? 'Creating...' : 'Save & Build Itinerary'}
          </button>
        </div>
      </form>
    </div>
  );
}
