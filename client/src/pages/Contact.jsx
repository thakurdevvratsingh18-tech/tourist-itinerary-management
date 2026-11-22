import React, { useState } from 'react';
import { contactService } from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactService.send({ name, email, subject, message });
      if (res.data?.success) {
        setSubmitted(true);
        toast.success('Your message has been received! Our curators will follow up.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
          Get In Touch
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-charcoal">
          Contact TravelCraft
        </h1>
        <p className="text-gray-600 text-sm font-light">
          Have an inquiry regarding route optimization, destination suggestions, or travel partnerships? Reach out to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-2 card p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-forest-700 mx-auto" />
              <h3 className="font-display text-xl font-bold text-charcoal">Message Dispatched</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Thank you for contacting TravelCraft. We have logged your inquiry and our team will get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="btn-secondary text-xs mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiry regarding Varanasi-Agra Route Plan"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="How can our itinerary system or team assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2.5 px-6 flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Transmitting...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-charcoal border-b border-gray-100 pb-2">
              Office Information
            </h3>
            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                <span>TravelCraft Technology Lab, Connaught Place, New Delhi 110001, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <span>support@travelcraft.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <span>+91 (0) 11 4820 9200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
