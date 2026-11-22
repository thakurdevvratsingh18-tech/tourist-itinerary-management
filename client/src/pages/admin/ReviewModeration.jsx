import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import { MessageSquare, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReviews();
      if (res.data?.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, status) => {
    try {
      const res = await adminService.moderateReview(id, status);
      if (res.data?.success) {
        toast.success(`Review ${status ? 'approved' : 'rejected'}.`);
        setReviews(reviews.map((r) => (r._id === id ? { ...r, isApproved: status } : r)));
      }
    } catch (err) {
      toast.error('Failed to moderate review.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading review moderation queue..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">Review Moderation Queue</h1>
        <p className="text-xs text-gray-500">
          Approve or reject community travel reviews and destination testimonials.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="card p-6 flex justify-between items-start gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <StarRating rating={rev.rating || 5} size="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-charcoal">{rev.title}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    rev.isApproved
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {rev.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{rev.content}</p>

              <div className="text-[11px] text-gray-400 pt-1">
                By {rev.user?.name || 'User'} &bull; Destination:{' '}
                {rev.destination?.name || 'Destination'}
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {!rev.isApproved ? (
                <button
                  onClick={() => handleModerate(rev._id, true)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              ) : (
                <button
                  onClick={() => handleModerate(rev._id, false)}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Unpublish</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
