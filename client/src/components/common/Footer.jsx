import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-ivory/80 pt-16 pb-12 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-800/60">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-beige text-forest-900 rounded flex items-center justify-center font-bold">
                <Compass className="w-5 h-5 text-forest-900" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                TravelCraft
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-300 font-light">
              A comprehensive Tourist Itinerary Management System engineered with intelligent route & budget optimization algorithms for authentic Indian travel journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-white font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/dashboard/composer" className="hover:text-white transition-colors">
                  Smart Journey Composer
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Regions */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-white font-semibold mb-4">
              Featured Circuits
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>Varanasi & Sarnath Pilgrimage</li>
              <li>Rajasthan Royal Forts & Palaces</li>
              <li>Kerala Backwaters & Tea Trails</li>
              <li>Himalayan Passes of Manali & Ladakh</li>
              <li>Goa Heritage & Coastal Coves</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-white font-semibold mb-4">
              System Support
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>support@travelcraft.com</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>+91 (0) 11 4820 9200</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} TravelCraft – Tourist Itinerary Management System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Designed with <Heart className="w-3.5 h-3.5 mx-1 text-terracotta inline" /> for discerning travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}
