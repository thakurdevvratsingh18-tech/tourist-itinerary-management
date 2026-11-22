import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationService, reviewService, favoriteService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';
import RouteMap from '../components/composer/RouteMap';
import {
  MapPin,
  Calendar,
  Wallet,
  Clock,
  Sparkles,
  Heart,
  MessageSquare,
  ArrowRight,
  Info,
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function DestinationDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDestinationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await destinationService.getBySlug(slug);
        if (res.data?.success) {
          const dest = res.data.data;
          setDestination(dest);

          // Fetch reviews
          if (dest._id) {
            const revRes = await reviewService.getByDestination(dest._id);
            if (revRes.data?.success) {
              setReviews(revRes.data.data || []);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load destination details:', err);
        setError('Could not load destination information.');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationData();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewContent.trim()) {
      toast.error('Please enter both a title and content for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewService.create({
        destination: destination._id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      });

      if (res.data?.success) {
        toast.success('Your review has been submitted for moderation.');
        setReviewTitle('');
        setReviewContent('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading destination dossier..." />;
  if (error || !destination) return <ErrorMessage message={error || 'Destination not found'} />;

  const primaryImage =
    destination.images?.find((img) => img.isPrimary)?.url ||
    destination.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

  const category = Array.isArray(destination.category)
    ? destination.category[0]
    : destination.category || 'heritage';

  return (
    <div className="pb-20 space-y-12">
      {/* ─── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative h-[420px] bg-forest-900 overflow-hidden">
        <img
          src={primaryImage}
          alt={destination.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-white space-y-3">
          <div className="flex items-center space-x-2">
            <Badge label={category} variant="forest" size="text-[11px]" />
            {destination.isFeatured && (
              <Badge label="Featured Destination" variant="terracotta" size="text-[11px]" />
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            {destination.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-200">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 text-terracotta mr-1.5" />
              {destination.state ? `${destination.state}, ` : ''}
              {destination.country || 'India'}
            </span>

            <span className="flex items-center">
              <StarRating rating={destination.averageRating || 4.5} size="w-3.5 h-3.5" />
              <strong className="ml-1.5">{destination.averageRating?.toFixed(1) || '4.5'}</strong>
              <span className="text-gray-300 ml-1">({destination.reviewCount || 0} reviews)</span>
            </span>

            {destination.bestSeason && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 text-beige mr-1.5" />
                Best Season: {destination.bestSeason.from} – {destination.bestSeason.to}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Content Layout ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 Cols): Overview, Attractions, Map, Reviews */}
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-charcoal">About {destination.name}</h2>
            <p className="text-sm text-gray-700 leading-relaxed font-light whitespace-pre-line">
              {destination.description}
            </p>
          </section>

          {/* Key Attractions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="font-display text-2xl font-bold text-charcoal">
                Principal Attractions ({destination.attractions?.length || 0})
              </h2>
            </div>

            <div className="space-y-4">
              {destination.attractions?.map((att, idx) => (
                <div
                  key={att._id || idx}
                  className="card p-5 flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-forest-800">#{idx + 1}</span>
                      <h3 className="font-display text-base font-bold text-charcoal">
                        {att.name}
                      </h3>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                        {att.type || 'monument'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{att.description}</p>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-start sm:items-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {att.duration || '2 hours'}
                    </span>
                    <span className="text-xs font-semibold text-forest-900 mt-1">
                      {att.estimatedCost ? `₹${att.estimatedCost}` : 'Free Entry'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Geographic Location & OpenStreetMap */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-charcoal">
              Geographic Location
            </h2>
            <p className="text-xs text-gray-500">
              Coordinates: Lat {destination.coordinates?.lat}, Lng {destination.coordinates?.lng}
            </p>
            {destination.coordinates && (
              <RouteMap
                origin={{
                  name: destination.name,
                  lat: destination.coordinates.lat,
                  lng: destination.coordinates.lng,
                }}
                destinations={destination.attractions || []}
                height="320px"
              />
            )}
          </section>

          {/* Reviews & Ratings Section */}
          <section className="space-y-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-charcoal">
                Traveler Reviews ({reviews.length})
              </h2>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                No reviews yet. Be the first traveler to review {destination.name}.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-forest-800 text-white flex items-center justify-center text-xs font-bold">
                          {rev.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-bold text-charcoal">
                          {rev.user?.name || 'Anonymous Traveler'}
                        </span>
                      </div>
                      <StarRating rating={rev.rating || 5} size="w-3 h-3" />
                    </div>

                    <h4 className="text-xs font-bold text-charcoal">{rev.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{rev.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Review Box */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="card p-6 space-y-4 bg-beige/30">
                <h3 className="font-display text-base font-bold text-charcoal">
                  Add Your Review for {destination.name}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
                  <StarRating
                    rating={reviewRating}
                    interactive={true}
                    onRatingChange={setReviewRating}
                    size="w-5 h-5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Review Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stunning sunrise experience"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Your Experience
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Share helpful tips, timings, or dining recommendations..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-xs text-gray-600">
                <Link to="/login" className="font-semibold text-forest-800 underline">
                  Sign in
                </Link>{' '}
                to leave a review for {destination.name}.
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar: Cost Matrix & Smart Plan CTA */}
        <div className="space-y-6">
          {/* Smart Journey Composer CTA Box */}
          <div className="card p-6 bg-forest-900 text-white space-y-4 shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta bg-beige/10 px-2 py-0.5 rounded">
              Route Optimizer
            </span>
            <h3 className="font-display text-xl font-bold text-white leading-tight">
              Add {destination.name} To Your Smart Journey
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Compose a multi-city itinerary starting from your home location with automated distance minimization and budget breakdown.
            </p>
            <Link
              to={`/dashboard/composer?dest=${destination._id}`}
              className="btn-terracotta w-full text-xs text-center flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compose Journey With This City</span>
            </Link>
          </div>

          {/* Daily Expenditure Benchmarks */}
          <div className="card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-charcoal border-b border-gray-100 pb-3 flex items-center">
              <Wallet className="w-4 h-4 text-forest-700 mr-2" />
              Estimated Daily Expenses
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded">
                <div>
                  <span className="font-semibold text-charcoal block">Budget Traveler</span>
                  <span className="text-[10px] text-gray-500">Hostels & Public Transit</span>
                </div>
                <span className="font-bold text-forest-900">
                  ₹{destination.estimatedDailyCost?.budget?.toLocaleString('en-IN') || '1,500'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-forest-50/50 border border-forest-100 rounded">
                <div>
                  <span className="font-semibold text-forest-900 block">Standard / Couple</span>
                  <span className="text-[10px] text-gray-500">3-Star Hotel & Cabs</span>
                </div>
                <span className="font-bold text-forest-900">
                  ₹{destination.estimatedDailyCost?.standard?.toLocaleString('en-IN') || '3,800'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded">
                <div>
                  <span className="font-semibold text-charcoal block">Luxury Heritage</span>
                  <span className="text-[10px] text-gray-500">Haveli Suites & Chauffeur</span>
                </div>
                <span className="font-bold text-forest-900">
                  ₹{destination.estimatedDailyCost?.luxury?.toLocaleString('en-IN') || '9,500'}
                </span>
              </div>
            </div>
          </div>

          {/* Practical Travel Details */}
          <div className="card p-6 space-y-3 text-xs">
            <h3 className="font-display text-base font-bold text-charcoal border-b border-gray-100 pb-2">
              Practical Information
            </h3>

            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Language</span>
              <span className="font-medium text-charcoal">{destination.language || 'Hindi, English'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Climate</span>
              <span className="font-medium text-charcoal">{destination.climate || 'Subtropical'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Currency</span>
              <span className="font-medium text-charcoal">Indian Rupee (INR - ₹)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
