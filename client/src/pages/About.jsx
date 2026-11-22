import React from 'react';
import { Compass, Sparkles, MapPin, ShieldCheck, Heart, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
          Architectural Philosophy
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal">
          Built for Genuine Travel Discovery
        </h1>
        <p className="text-gray-600 text-base font-light leading-relaxed">
          TravelCraft was conceived as a major software engineering project designed to eliminate superficial travel planning by marrying genuine mathematical graph theory with human-curated destination dossiers.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card p-8 space-y-3">
          <div className="w-10 h-10 bg-forest-100 rounded flex items-center justify-center text-forest-800">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-charcoal">Algorithmic Precision</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every itinerary distance calculation utilizes spherical Earth geometry (Haversine formula), while route sequences are optimized via Nearest Neighbor heuristics refined through 2-Opt local search improvements.
          </p>
        </div>

        <div className="card p-8 space-y-3">
          <div className="w-10 h-10 bg-forest-100 rounded flex items-center justify-center text-forest-800">
            <Sparkles className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-display text-lg font-bold text-charcoal">Interest-Weighted Journeys</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            We reject one-size-fits-all travel. Our Smart Journey Composer dynamically weights destinations and attractions based on traveler affinities—whether for heritage, spiritual sacred sites, mountain passes, or culinary discoveries.
          </p>
        </div>

        <div className="card p-8 space-y-3">
          <div className="w-10 h-10 bg-forest-100 rounded flex items-center justify-center text-forest-800">
            <ShieldCheck className="w-5 h-5 text-forest-800" />
          </div>
          <h3 className="font-display text-lg font-bold text-charcoal">Full Lifecycle Management</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            From initial route composition to daily activity scheduling, real-time budget tracking, booking documentation, and printable PDF exports, users manage every dimension of their trip in one cohesive workspace.
          </p>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="bg-white p-8 md:p-12 rounded border border-gray-200 space-y-6">
        <h2 className="font-display text-2xl font-bold text-charcoal">Technology Stack & Engineering</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-gray-600">
          <div>
            <strong className="block text-charcoal text-sm mb-1 font-semibold">Frontend</strong>
            <p>React 18, Vite 5, Tailwind CSS, React Router v6, Lucide Icons</p>
          </div>
          <div>
            <strong className="block text-charcoal text-sm mb-1 font-semibold">Backend</strong>
            <p>Node.js, Express.js REST APIs, Joi Validation, Helmet Security</p>
          </div>
          <div>
            <strong className="block text-charcoal text-sm mb-1 font-semibold">Database</strong>
            <p>MongoDB with Mongoose Schemas, Indexes, Compound Constraints</p>
          </div>
          <div>
            <strong className="block text-charcoal text-sm mb-1 font-semibold">Algorithms & Maps</strong>
            <p>Haversine Distance, Nearest Neighbor TSP, 2-Opt Search, Leaflet OSM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
