import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { destinationService, composerService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import RouteMap from '../../components/composer/RouteMap';
import PlanCard from '../../components/composer/PlanCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { exportItineraryToPDF } from '../../utils/pdfExport';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Compass,
  Check,
  Plus,
  Trash2,
  Printer,
  Save,
  ArrowRight,
  Info,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { TRANSPORT_MODES, INTEREST_OPTIONS } from '../../utils/constants';

export default function SmartJourneyComposer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Catalog destinations available for selection
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Form State
  const [originCity, setOriginCity] = useState(searchParams.get('origin') || 'New Delhi');
  const [originLat, setOriginLat] = useState(28.6139);
  const [originLng, setOriginLng] = useState(77.209);
  const [selectedDestIds, setSelectedDestIds] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [days, setDays] = useState(parseInt(searchParams.get('days') || '5', 10));
  const [travelers, setTravelers] = useState(parseInt(searchParams.get('travelers') || '2', 10));
  const [totalBudget, setTotalBudget] = useState(40000);
  const [transportPreference, setTransportPreference] = useState('mixed');
  const [selectedInterests, setSelectedInterests] = useState(['heritage', 'spiritual']);

  // Optimization Result State
  const [optimizing, setOptimizing] = useState(false);
  const [composerResult, setComposerResult] = useState(null);
  const [selectedPlanStrategy, setSelectedPlanStrategy] = useState('distance'); // 'distance' or 'experience'
  const [savingTrip, setSavingTrip] = useState(false);

  // Fetch all destinations from DB on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await destinationService.getAll();
        if (res.data?.success) {
          const list = res.data.data || [];
          setAvailableDestinations(list);

          // If URL param 'dest' is set, auto-select it
          const paramDest = searchParams.get('dest');
          if (paramDest) {
            setSelectedDestIds([paramDest]);
          } else if (list.length >= 3) {
            // Default 3 iconic destinations for demo
            setSelectedDestIds([list[0]._id, list[1]._id, list[2]._id]);
          }
        }
      } catch (err) {
        console.error('Failed to load destination catalog:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCatalog();
  }, [searchParams]);

  // Toggle destination selection
  const handleToggleDestination = (id) => {
    if (selectedDestIds.includes(id)) {
      setSelectedDestIds(selectedDestIds.filter((dId) => dId !== id));
    } else {
      setSelectedDestIds([...selectedDestIds, id]);
    }
  };

  // Toggle interests
  const handleToggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((iId) => iId !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // Run the Optimization Algorithm
  const handleOptimize = async (e) => {
    if (e) e.preventDefault();

    if (selectedDestIds.length === 0) {
      toast.error('Please select at least one destination to optimize your journey.');
      return;
    }

    setOptimizing(true);
    try {
      const payload = {
        origin: {
          name: originCity,
          lat: originLat,
          lng: originLng,
        },
        destinationIds: selectedDestIds,
        startDate,
        days,
        totalBudget,
        travelers,
        transportPreference,
        interests: selectedInterests,
      };

      const res = await composerService.optimize(payload);
      if (res.data?.success) {
        setComposerResult(res.data.data);
        toast.success('Generated 2 algorithmic route plans!');
      }
    } catch (err) {
      console.error('Optimization error:', err);
      toast.error(err.response?.data?.message || 'Algorithm calculation failed.');
    } finally {
      setOptimizing(false);
    }
  };

  // Save the selected plan to database as a real Trip
  const handleSaveAsTrip = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to save this itinerary to your personal dashboard.');
      navigate('/login');
      return;
    }

    if (!composerResult) return;

    const chosenPlan =
      selectedPlanStrategy === 'distance' ? composerResult.planA : composerResult.planB;

    setSavingTrip(true);
    try {
      const payload = {
        title: `${originCity} to ${chosenPlan.orderedDestinations.map((d) => d.name).join(' - ')} (${days} Days)`,
        plan: chosenPlan,
        startDate,
        days,
        travelers,
        transportPreference,
      };

      const res = await composerService.saveAsTrip(payload);
      if (res.data?.success) {
        toast.success('Itinerary successfully saved to your Trips!');
        navigate(`/dashboard/trips/${res.data.tripId}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save trip.');
    } finally {
      setSavingTrip(false);
    }
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    if (!composerResult) return;
    const chosenPlan =
      selectedPlanStrategy === 'distance' ? composerResult.planA : composerResult.planB;

    exportItineraryToPDF(
      {
        title: `Smart Journey (${chosenPlan.name})`,
        startDate,
        endDate: new Date(new Date(startDate).getTime() + (days - 1) * 24 * 60 * 60 * 1000),
        numberOfDays: days,
        numberOfTravelers: travelers,
        totalBudget: chosenPlan.budgetBreakdown?.totalEstimated || totalBudget,
        description: chosenPlan.description,
      },
      chosenPlan.itinerary
    );
  };

  if (loadingCatalog) return <LoadingSpinner message="Initializing Smart Composer Engine..." />;

  const currentPlan =
    composerResult && (selectedPlanStrategy === 'distance' ? composerResult.planA : composerResult.planB);

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta bg-beige/80 px-2 py-0.5 rounded">
              Signature Algorithm Engine
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal">
            Smart Journey Composer
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl mt-1">
            Generates day-wise travel itineraries using mathematical Nearest Neighbor heuristics, 2-Opt TSP search, and budget allocation models.
          </p>
        </div>

        {composerResult && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportPDF}
              className="btn-secondary text-xs flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSaveAsTrip}
              disabled={savingTrip}
              className="btn-primary text-xs flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingTrip ? 'Saving...' : 'Save As Trip'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Composer Form & Parameters ───────────────────────────────────────── */}
      <form onSubmit={handleOptimize} className="card p-6 md:p-8 space-y-8 bg-white">
        <h2 className="font-display text-xl font-bold text-charcoal flex items-center">
          <Compass className="w-5 h-5 text-forest-700 mr-2" />
          1. Journey Constraints & Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Starting Origin */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Starting Origin City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-forest-700 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="e.g. New Delhi"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-forest-700 absolute left-3 top-3" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          {/* Days */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Trip Duration ({days} Days)
            </label>
            <input
              type="range"
              min="2"
              max="14"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="w-full accent-forest-800 mt-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>2 Days</span>
              <span>7 Days</span>
              <span>14 Days</span>
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Travelers ({travelers})
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-forest-700 absolute left-3 top-3" />
              <input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value, 10))}
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Budget & Transport Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-600">
                Total Travel Budget (INR)
              </label>
              <span className="text-xs font-bold text-forest-900">
                ₹{totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseInt(e.target.value, 10))}
              className="w-full accent-forest-800"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹10,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000+</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Transport Preference
            </label>
            <select
              value={transportPreference}
              onChange={(e) => setTransportPreference(e.target.value)}
              className="select-field text-xs py-2"
            >
              {TRANSPORT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Multi-Select Pills */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Select Candidate Destinations ({selectedDestIds.length} chosen):
            </label>
            <span className="text-[11px] text-gray-500">Click to add/remove cities</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableDestinations.map((dest) => {
              const isSelected = selectedDestIds.includes(dest._id);
              return (
                <button
                  type="button"
                  key={dest._id}
                  onClick={() => handleToggleDestination(dest._id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                    isSelected
                      ? 'bg-forest-800 text-white border-forest-900 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-forest-700'
                  }`}
                >
                  <span>{dest.name}</span>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-beige" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Interests (Affinities) */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Travel Interests & Passions (Guides Plan B Scoring):
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  type="button"
                  key={interest.id}
                  onClick={() => handleToggleInterest(interest.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {interest.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={optimizing}
            className="btn-primary text-xs py-3 px-8 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span>{optimizing ? 'Executing Route Algorithms...' : 'Generate Optimized Plans'}</span>
          </button>
        </div>
      </form>

      {/* ─── 2. Generated Plans Comparison (Plan A vs Plan B) ──────────────────── */}
      {composerResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta block mb-1">
              Algorithmic Comparison
            </span>
            <h2 className="font-display text-2xl font-bold text-charcoal">
              Choose Between Two Optimized Strategies
            </h2>
            <p className="text-xs text-gray-500">
              Select your preferred route plan below to view its daily schedule, interactive map, and budget breakdown.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlanCard
              plan={composerResult.planA}
              isSelected={selectedPlanStrategy === 'distance'}
              onSelect={() => setSelectedPlanStrategy('distance')}
              badgeText="Plan A – Distance Minimized"
            />
            <PlanCard
              plan={composerResult.planB}
              isSelected={selectedPlanStrategy === 'experience'}
              onSelect={() => setSelectedPlanStrategy('experience')}
              badgeText="Plan B – Experience Optimized"
            />
          </div>

          {/* ─── 3. Selected Plan Route Map & Daily Schedule ─────────────────────── */}
          {currentPlan && (
            <div className="card p-6 md:p-8 space-y-8 bg-white border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-forest-800 bg-forest-50 border border-forest-200 px-2.5 py-0.5 rounded">
                    Active Route Visualization
                  </span>
                  <h3 className="font-display text-xl font-bold text-charcoal mt-1">
                    {currentPlan.name} Route Map & Timeline
                  </h3>
                </div>

                <div className="text-xs text-gray-500">
                  Total Journey Distance:{' '}
                  <strong className="text-forest-900 font-bold">
                    {currentPlan.totalDistanceKm} km
                  </strong>
                </div>
              </div>

              {/* Interactive Leaflet Map */}
              <RouteMap
                origin={composerResult.origin}
                destinations={currentPlan.orderedDestinations || []}
                routeColor={selectedPlanStrategy === 'distance' ? '#254d25' : '#c1694f'}
                height="380px"
              />

              {/* Budget Breakdown Summary */}
              <div className="bg-beige/50 p-5 rounded border border-gray-200/80 space-y-3">
                <h4 className="font-display text-sm font-bold text-charcoal flex items-center">
                  <Wallet className="w-4 h-4 text-forest-700 mr-2" />
                  Estimated Budget Distribution
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase">Transport</span>
                    <strong className="text-charcoal font-semibold">
                      ₹{currentPlan.budgetBreakdown?.transport?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase">Stays</span>
                    <strong className="text-charcoal font-semibold">
                      ₹{currentPlan.budgetBreakdown?.accommodation?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase">Dining</span>
                    <strong className="text-charcoal font-semibold">
                      ₹{currentPlan.budgetBreakdown?.food?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase">Activities</span>
                    <strong className="text-charcoal font-semibold">
                      ₹{currentPlan.budgetBreakdown?.sightseeing?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-forest-100/60 p-2.5 rounded border border-forest-200">
                    <span className="text-forest-800 block text-[10px] uppercase font-bold">
                      Est. Total
                    </span>
                    <strong className="text-forest-900 font-bold">
                      ₹{currentPlan.budgetBreakdown?.totalEstimated?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Schedule */}
              <div className="space-y-4">
                <h4 className="font-display text-lg font-bold text-charcoal">
                  Day-by-Day Itinerary ({currentPlan.itinerary?.length} Days)
                </h4>

                <div className="space-y-4">
                  {currentPlan.itinerary?.map((day) => (
                    <div key={day.day} className="border border-gray-200 rounded p-5 space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white bg-forest-800 px-2 py-0.5 rounded">
                            Day {day.day}
                          </span>
                          <h5 className="font-display text-sm font-bold text-charcoal">
                            {day.title}
                          </h5>
                        </div>
                        <span className="text-xs text-gray-500">{day.date}</span>
                      </div>

                      <div className="space-y-2">
                        {day.activities?.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            className="flex items-start justify-between text-xs p-2.5 bg-gray-50 rounded"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-charcoal">{act.title}</span>
                              <p className="text-[11px] text-gray-500">{act.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <span className="text-gray-400 text-[11px] block">
                                {act.startTime} – {act.endTime}
                              </span>
                              {act.estimatedCost > 0 && (
                                <span className="font-semibold text-forest-900">
                                  ₹{act.estimatedCost}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="btn-secondary text-xs w-full sm:w-auto flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export Itinerary as PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsTrip}
                  disabled={savingTrip}
                  className="btn-primary text-xs w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingTrip ? 'Saving Trip...' : `Save ${currentPlan.name} to My Trips`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
