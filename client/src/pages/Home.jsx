import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destinationService } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  Search,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick planner search form state
  const [searchOrigin, setSearchOrigin] = useState('New Delhi');
  const [searchDays, setSearchDays] = useState(5);
  const [searchTravelers, setSearchTravelers] = useState(2);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await destinationService.getFeatured();
        if (res.data?.success) {
          setFeaturedDestinations(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching featured destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickPlan = (e) => {
    e.preventDefault();
    navigate(
      `/dashboard/composer?origin=${encodeURIComponent(searchOrigin)}&days=${searchDays}&travelers=${searchTravelers}`
    );
  };

  return (
    <div className="space-y-20 pb-20">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[580px] bg-forest-900 flex items-center justify-center text-ivory px-4 py-20 overflow-hidden">
        {/* Subtle patterned background overlay */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80")',
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-beige/10 border border-beige/20 px-3.5 py-1 rounded text-xs font-medium text-beige tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Smart Route & Budget Optimizer</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Craft Your Perfect <br />
            <span className="italic font-normal text-beige">Indian Travel Journey</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-200 font-light leading-relaxed">
            Experience intelligent travel planning backed by genuine geographic distance calculations,
            Nearest Neighbor & 2-opt route sequencing, and constraint-aware budget distribution.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleQuickPlan}
            className="mt-8 bg-white p-3 sm:p-4 rounded shadow-2xl border border-gray-200 text-charcoal max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3 text-left"
          >
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Starting City
              </label>
              <div className="flex items-center border border-gray-300 rounded px-2.5 py-2">
                <MapPin className="w-4 h-4 text-forest-700 mr-1.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  className="w-full text-xs focus:outline-none bg-transparent"
                  placeholder="e.g. New Delhi"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Duration (Days)
              </label>
              <div className="flex items-center border border-gray-300 rounded px-2.5 py-2">
                <Calendar className="w-4 h-4 text-forest-700 mr-1.5 flex-shrink-0" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={searchDays}
                  onChange={(e) => setSearchDays(e.target.value)}
                  className="w-full text-xs focus:outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Travelers
              </label>
              <div className="flex items-center border border-gray-300 rounded px-2.5 py-2">
                <Users className="w-4 h-4 text-forest-700 mr-1.5 flex-shrink-0" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={searchTravelers}
                  onChange={(e) => setSearchTravelers(e.target.value)}
                  className="w-full text-xs focus:outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="btn-primary w-full h-[38px] text-xs flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimize Route</span>
              </button>
            </div>
          </form>

          {/* Quick Metrics */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-300">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-forest-400 mr-1.5" />
              15 Curated Indian Destinations
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-forest-400 mr-1.5" />
              Distance & Experience Dual-Plan Generator
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-forest-400 mr-1.5" />
              100% Deterministic TSP Algorithms
            </span>
          </div>
        </div>
      </section>

      {/* ─── Featured Destinations Grid ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta block mb-1">
              Curated Highlights
            </span>
            <h2 className="section-title">Iconic Destinations of India</h2>
            <p className="section-subtitle">
              Handcrafted destination dossiers with heritage details, attractions, and seasonal daily cost metrics.
            </p>
          </div>
          <Link
            to="/destinations"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-forest-800 hover:text-forest-950 group"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading curated destinations..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.slice(0, 6).map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Smart Journey Composer Feature Spotlight ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-800 rounded text-ivory p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-forest-700 shadow-lg">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="bg-terracotta text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded inline-block">
              Signature Feature
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Smart Journey Composer
            </h2>

            <p className="text-gray-200 text-sm sm:text-base font-light leading-relaxed">
              Eliminate guesswork with our dual-strategy route engine. Plan A applies Nearest Neighbor and 2-Opt local search to minimize road/rail distance, while Plan B scores destinations according to your personal affinities (spiritual, adventure, wildlife, relaxation).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
              <div className="flex items-start space-x-3 p-3 bg-forest-900/50 rounded border border-forest-700">
                <Compass className="w-5 h-5 text-beige flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Plan A: Distance Optimized</h4>
                  <p className="text-gray-300">Reduces overall travel kilometers and transit costs through algorithmic TSP sequencing.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-forest-900/50 rounded border border-forest-700">
                <Sparkles className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Plan B: Experience Optimized</h4>
                  <p className="text-gray-300">Directs your time and resources toward top-rated attractions matching your chosen passions.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/dashboard/composer" className="btn-terracotta text-xs py-3 px-6">
                Launch Smart Composer
              </Link>
              <Link to="/about" className="btn-secondary text-xs py-3 px-6 bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white">
                How The Math Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (3 Steps) ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta block mb-1">
          Simple Workflow
        </span>
        <h2 className="section-title mb-4">How TravelCraft Works</h2>
        <p className="section-subtitle mx-auto mb-14">
          From concept to execution in three clear, structured phases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="card p-8 relative">
            <span className="font-display text-4xl font-bold text-gray-200 absolute top-6 right-6">
              01
            </span>
            <div className="w-10 h-10 bg-forest-100 rounded flex items-center justify-center text-forest-800 mb-5">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-charcoal mb-2">Select Destinations</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pick from our collection of Indian destinations or input your desired regions, starting location, and travel dates.
            </p>
          </div>

          <div className="card p-8 relative">
            <span className="font-display text-4xl font-bold text-gray-200 absolute top-6 right-6">
              02
            </span>
            <div className="w-10 h-10 bg-forest-100 rounded flex items-center justify-center text-forest-800 mb-5">
              <Sparkles className="w-5 h-5 text-terracotta" />
            </div>
            <h3 className="font-display text-lg font-bold text-charcoal mb-2">Generate & Compare Plans</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our route optimizer calculates distances and produces two distinct plans (Distance vs. Experience) with interactive Leaflet map routes.
            </p>
          </div>

          <div className="card p-8 relative">
            <span className="font-display text-4xl font-bold text-gray-200 absolute top-6 right-6">
              03
            </span>
            <div className="w-10 h-10 bg-forest-100 rounded flex items-center justify-center text-forest-800 mb-5">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-charcoal mb-2">Save, Manage & Export</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Save directly to your user dashboard to manage daily activities, track actual expenses, log bookings, and export clean PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Editorial Testimonials ────────────────────────────────────────────── */}
      <section className="bg-beige/60 py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta block mb-1">
              Field Tested
            </span>
            <h2 className="section-title">Words From Discerning Travelers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded border border-gray-200 shadow-xs">
              <p className="text-xs text-gray-600 italic mb-4 leading-relaxed">
                "The distance-optimized plan saved us nearly 400 kilometers on our Rajasthan circuit. Seeing the Haversine calculation details and 2-opt swaps gave us total confidence."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Rohit Singhania</h4>
                  <p className="text-[10px] text-gray-400">Jaipur & Udaipur Circuit</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded border border-gray-200 shadow-xs">
              <p className="text-xs text-gray-600 italic mb-4 leading-relaxed">
                "We loved the day-by-day budget breakdown. Tracking train fares vs accommodation and having the printable PDF on the go made our Kerala backwaters trip seamless."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
                  AP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Ananya Patel</h4>
                  <p className="text-[10px] text-gray-400">Alleppey & Coorg Retreat</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded border border-gray-200 shadow-xs">
              <p className="text-xs text-gray-600 italic mb-4 leading-relaxed">
                "The clean editorial aesthetic is refreshing. No generic AI fluff—real coordinates, genuine attraction timings, and rock-solid routing."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
                  VM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Vikram Malhotra</h4>
                  <p className="text-[10px] text-gray-400">Varanasi & Rishikesh Journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
