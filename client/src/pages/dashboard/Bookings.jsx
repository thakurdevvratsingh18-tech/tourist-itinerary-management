import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { BookmarkCheck, Plus, Trash2, Calendar, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { BOOKING_TYPES } from '../../utils/constants';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [type, setType] = useState('accommodation');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAll();
      if (res.data?.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await bookingService.create({
        type,
        title,
        provider,
        confirmationNumber,
        startDate,
        amount,
        status: 'confirmed',
      });
      if (res.data?.success) {
        toast.success('Booking documented successfully.');
        setModalOpen(false);
        setTitle('');
        setConfirmationNumber('');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to document booking.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking record?')) return;
    try {
      await bookingService.delete(id);
      toast.success('Booking removed.');
      setBookings(bookings.filter((b) => b._id !== id));
    } catch (err) {
      toast.error('Failed to delete booking.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading travel bookings..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Booking Management</h1>
          <p className="text-xs text-gray-500">
            Document transport, stay, and excursion reservations with confirmation identifiers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Booking</span>
        </button>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Documented"
          description="Keep your hotel vouchers, train PNRs, and flight ticket references organized in one place."
          actionLabel="Document a Booking"
          onAction={() => setModalOpen(true)}
          icon={BookmarkCheck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-forest-800 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded">
                  {b.type}
                </span>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="text-gray-300 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-charcoal">{b.title}</h3>
                <p className="text-xs text-gray-500">{b.provider || 'Provider'}</p>
              </div>

              <div className="p-2.5 bg-gray-50 rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ref / Confirmation:</span>
                  <strong className="text-charcoal font-mono">
                    {b.confirmationNumber || 'N/A'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-charcoal">
                    {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
                {b.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <strong className="text-forest-900 font-bold">
                      ₹{b.amount?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Booking Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Document a Booking Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Booking Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="select-field text-xs"
            >
              {BOOKING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title / Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Radisson Blu Agra (2 Nights)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Provider / Platform</label>
              <input
                type="text"
                placeholder="e.g. IRCTC, MakeMyTrip"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">PNR / Ref #</label>
              <input
                type="text"
                placeholder="e.g. 2490184"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                className="input-field text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (INR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
