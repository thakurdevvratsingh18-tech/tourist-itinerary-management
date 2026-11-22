import React from 'react';
import { Check, Compass, Clock, Wallet, CheckCircle, Info } from 'lucide-react';

export default function PlanCard({ plan, isSelected, onSelect, badgeText }) {
  if (!plan) return null;

  return (
    <div
      onClick={onSelect}
      className={`card cursor-pointer transition-all p-6 relative flex flex-col justify-between ${
        isSelected
          ? 'ring-2 ring-forest-800 border-forest-800 bg-forest-50/20 shadow-md'
          : 'hover:border-gray-300'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                plan.strategy === 'distance'
                  ? 'bg-forest-100 text-forest-900 border border-forest-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {badgeText || (plan.strategy === 'distance' ? 'Plan A' : 'Plan B')}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {plan.strategy === 'distance' ? 'Nearest Neighbor & 2-Opt' : 'Interest-Weighted'}
            </span>
          </div>

          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-forest-800 text-white'
                : 'border border-gray-300 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="font-display text-xl font-bold text-charcoal mb-1">{plan.name}</h3>
        <p className="text-xs text-gray-600 mb-5 leading-relaxed">{plan.description}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-beige/60 rounded border border-gray-200/80 mb-5 text-center">
          <div>
            <div className="flex items-center justify-center text-xs text-gray-500 mb-0.5">
              <Compass className="w-3.5 h-3.5 mr-1 text-forest-700" />
              <span>Distance</span>
            </div>
            <div className="text-sm font-bold text-charcoal">
              {plan.totalDistanceKm.toLocaleString('en-IN')} km
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center text-xs text-gray-500 mb-0.5">
              <Clock className="w-3.5 h-3.5 mr-1 text-forest-700" />
              <span>Travel Time</span>
            </div>
            <div className="text-sm font-bold text-charcoal">
              ~{plan.estimatedTravelHours} hrs
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center text-xs text-gray-500 mb-0.5">
              <Wallet className="w-3.5 h-3.5 mr-1 text-forest-700" />
              <span>Est. Budget</span>
            </div>
            <div className="text-sm font-bold text-forest-900">
              ₹{plan.budgetBreakdown?.totalEstimated?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Ordered Destination Route List */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Route Stops ({plan.orderedDestinations?.length || 0}):
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {plan.orderedDestinations?.map((dest, idx) => (
              <React.Fragment key={dest._id || idx}>
                <span className="bg-white border border-gray-200 px-2 py-1 rounded text-charcoal font-medium shadow-2xs">
                  {idx + 1}. {dest.name}
                </span>
                {idx < plan.orderedDestinations.length - 1 && (
                  <span className="text-gray-400 font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Reasoning points */}
        <div className="space-y-1.5">
          <div className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            <Info className="w-3.5 h-3.5 mr-1 text-forest-700" />
            <span>Algorithm Reasoning:</span>
          </div>
          {plan.reasoning?.map((reason, rIdx) => (
            <p key={rIdx} className="text-xs text-gray-600 flex items-start">
              <span className="text-forest-700 mr-1.5 leading-tight font-bold">•</span>
              <span>{reason}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Per Person:{' '}
          <strong className="text-charcoal">
            ₹{plan.budgetBreakdown?.perPerson?.toLocaleString('en-IN')}
          </strong>
        </span>
        <button
          type="button"
          className={`font-semibold ${
            isSelected ? 'text-forest-800' : 'text-gray-500'
          }`}
        >
          {isSelected ? 'Selected Plan' : 'Click to Select'}
        </button>
      </div>
    </div>
  );
}
