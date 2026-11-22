import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { destinationService } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { DESTINATION_CATEGORIES } from '../utils/constants';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;

        const res = await destinationService.getAll(params);
        if (res.data?.success) {
          let list = res.data.data || [];

          // Sort in memory
          if (sortBy === 'rating_desc') {
            list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          } else if (sortBy === 'cost_asc') {
            list.sort(
              (a, b) =>
                (a.estimatedDailyCost?.budget || 0) - (b.estimatedDailyCost?.budget || 0)
            );
          } else if (sortBy === 'cost_desc') {
            list.sort(
              (a, b) =>
                (b.estimatedDailyCost?.budget || 0) - (a.estimatedDailyCost?.budget || 0)
            );
          } else if (sortBy === 'name_asc') {
            list.sort((a, b) => a.name.localeCompare(b.name));
          }

          setDestinations(list);
        }
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [searchQuery, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('rating_desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta block mb-1">
          Explore India
        </span>
        <h1 className="section-title">Destinations Catalog</h1>
        <p className="section-subtitle">
          Search across 15+ verified destinations with historical records, coordinates, and seasonal daily expenditure estimations.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by city, state, or attraction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Categories & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-field text-xs py-2 w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {DESTINATION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-field text-xs py-2 w-full sm:w-auto"
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="cost_asc">Cost: Low to High</option>
            <option value="cost_desc">Cost: High to Low</option>
            <option value="name_asc">Alphabetical (A-Z)</option>
          </select>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-800 font-semibold underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <LoadingSpinner message="Searching destinations..." />
      ) : destinations.length === 0 ? (
        <EmptyState
          title="No destinations matched your criteria"
          description="Try removing your search term or selecting 'All Categories' to view the complete catalog."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
            <span>
              Showing <strong>{destinations.length}</strong> destinations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
