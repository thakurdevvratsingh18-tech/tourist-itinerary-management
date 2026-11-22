import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Lock, Save, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone, bio, country });
      toast.success('Profile details updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await authService.updatePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        toast.success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">Account & Profile</h1>
        <p className="text-xs text-gray-500">Manage your credentials and personal travel preferences.</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="card p-6 md:p-8 space-y-5 bg-white">
        <h2 className="font-display text-lg font-bold text-charcoal flex items-center">
          <User className="w-4 h-4 text-forest-700 mr-2" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="input-field text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field text-xs"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Home Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Traveler Bio</label>
          <textarea
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field text-xs"
            placeholder="Share your travel interests and preferred modes of transport..."
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={savingProfile} className="btn-primary text-xs">
            {savingProfile ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>

      {/* Password Reset Card */}
      <form onSubmit={handlePasswordSubmit} className="card p-6 md:p-8 space-y-4 bg-white">
        <h2 className="font-display text-lg font-bold text-charcoal flex items-center">
          <Lock className="w-4 h-4 text-forest-700 mr-2" />
          Security Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field text-xs"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={changingPassword} className="btn-secondary text-xs">
            {changingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
