import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StarRating from '../../components/common/StarRating';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getMyReviews();
      if (res.data?.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewService.delete(id);
      toast.success('Review deleted.');
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your reviews..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">My Reviews & Ratings</h1>
        <p className="text-xs text-gray-500">
          Reviews you have contributed to help travelers plan authentic journeys.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No Reviews Submitted"
          description="Share your insights on destinations you have visited to aid fellow explorers."
          icon={Star}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="card p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <StarRating rating={rev.rating || 5} size="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                      {rev.isApproved ? 'Approved' : 'Pending Moderation'}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-charcoal">{rev.title}</h3>
                  <p className="text-xs text-gray-400">
                    Destination: {rev.destination?.name || 'Indian Destination'}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(rev._id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{rev.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
