import React, { useState, useEffect } from 'react';
import { destinationService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { MapPin, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { DESTINATION_CATEGORIES } from '../../utils/constants';

export default function DestinationManagement() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [category, setCategory] = useState('heritage');
  const [lat, setLat] = useState(25.0);
  const [lng, setLng] = useState(82.0);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [budgetCost, setBudgetCost] = useState(1500);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await destinationService.getAll();
      if (res.data?.success) {
        setDestinations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await destinationService.create({
        name,
        state,
        country,
        category: [category],
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        shortDescription,
        description,
        estimatedDailyCost: { budget: budgetCost, standard: budgetCost * 2, luxury: budgetCost * 5 },
      });

      if (res.data?.success) {
        toast.success('Destination added to catalog.');
        setModalOpen(false);
        fetchDestinations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create destination.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await destinationService.delete(id);
      toast.success('Destination removed.');
      setDestinations(destinations.filter((d) => d._id !== id));
    } catch (err) {
      toast.error('Failed to delete destination.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading destination repository..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Destination Catalog Management</h1>
          <p className="text-xs text-gray-500">
            Create, update, and manage official Indian destination dossiers and coordinates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Destination</span>
        </button>
      </div>

      <div className="card overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">State / Region</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Budget / Day</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {destinations.map((d) => (
              <tr key={d._id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4 font-semibold text-charcoal">{d.name}</td>
                <td className="py-3 px-4 text-gray-500">{d.state || 'N/A'}</td>
                <td className="py-3 px-4 capitalize text-forest-800">
                  {Array.isArray(d.category) ? d.category[0] : d.category}
                </td>
                <td className="py-3 px-4 text-gray-700 font-medium">★ {d.averageRating || 4.5}</td>
                <td className="py-3 px-4 text-gray-700">
                  ₹{d.estimatedDailyCost?.budget?.toLocaleString('en-IN') || 1500}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="text-gray-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Destination Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Destination Dossier">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Varanasi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">State / Province</label>
              <input
                type="text"
                required
                placeholder="e.g. Uttar Pradesh"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select-field text-xs"
              >
                {DESTINATION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Summary (1 sentence)</label>
            <input
              type="text"
              required
              placeholder="e.g. Ancient holy city on the sacred banks of the Ganges."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Detailed Description</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field text-xs"
            />
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
              Save Destination
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
