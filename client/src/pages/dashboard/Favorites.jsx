import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../../services/api';
import DestinationCard from '../../components/destinations/DestinationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteService.getAll();
      if (res.data?.success) {
        setFavorites(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (destId) => {
    try {
      await favoriteService.remove(destId);
      toast.success('Destination removed from favorites.');
      setFavorites(favorites.filter((f) => (f.destination?._id || f.destination) !== destId));
    } catch (err) {
      toast.error('Failed to remove favorite.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading saved destinations..." />;

  const destinationItems = favorites
    .map((f) => f.destination)
    .filter((d) => d && typeof d === 'object');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">Favorite Destinations</h1>
        <p className="text-xs text-gray-500">
          Saved Indian travel spots for future itinerary composition.
        </p>
      </div>

      {destinationItems.length === 0 ? (
        <EmptyState
          title="No Favorite Destinations Saved"
          description="Browse our curated Indian destinations catalog and click the heart icon to save spots to your wishlist."
          actionLabel="Explore Catalog"
          onAction={() => (window.location.href = '/destinations')}
          icon={Heart}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinationItems.map((dest) => (
            <DestinationCard
              key={dest._id}
              destination={dest}
              onFavoriteToggle={() => handleRemove(dest._id)}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
