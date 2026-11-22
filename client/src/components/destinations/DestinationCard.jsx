import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Heart } from 'lucide-react';
import StarRating from '../common/StarRating';
import Badge from '../common/Badge';

export default function DestinationCard({ destination, onFavoriteToggle, isFavorited }) {
  const primaryImg =
    destination.images?.find((img) => img.isPrimary)?.url ||
    destination.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

  const category = Array.isArray(destination.category)
    ? destination.category[0]
    : destination.category || 'destination';

  return (
    <div className="card-hover group flex flex-col h-full overflow-hidden bg-white">
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={primaryImg}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <Badge label={category} variant="forest" size="text-[10px]" />
          {destination.isFeatured && (
            <Badge label="Featured" variant="terracotta" size="text-[10px]" />
          )}
        </div>

        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle(destination._id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-gray-600 hover:text-red-500 transition-colors shadow-sm"
            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center text-xs text-gray-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1 text-forest-700 flex-shrink-0" />
            <span>
              {destination.state ? `${destination.state}, ` : ''}
              {destination.country || 'India'}
            </span>
          </div>

          <h3 className="font-display text-xl font-bold text-charcoal group-hover:text-forest-800 transition-colors mb-2">
            {destination.name}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {destination.shortDescription || destination.description}
          </p>
        </div>

        <div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <StarRating rating={destination.averageRating || 4.5} size="w-3.5 h-3.5" />
                <span className="text-xs font-semibold text-charcoal">
                  {destination.averageRating?.toFixed(1) || '4.5'}
                </span>
                <span className="text-[11px] text-gray-400">
                  ({destination.reviewCount || 0})
                </span>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                From{' '}
                <span className="font-medium text-forest-900">
                  ₹{destination.estimatedDailyCost?.budget?.toLocaleString('en-IN') || '1,500'}
                </span>
                /day
              </div>
            </div>

            <Link
              to={`/destinations/${destination.slug || destination._id}`}
              className="inline-flex items-center text-xs font-semibold text-forest-800 hover:text-forest-950 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
