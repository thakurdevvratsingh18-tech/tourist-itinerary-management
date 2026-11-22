import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Trash2, Shield, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.data?.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      toast.error('Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.data?.success) {
        toast.success('User deleted.');
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading user directory..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">User & Role Management</h1>
        <p className="text-xs text-gray-500">
          Manage registered accounts and role-based permissions (tourist, admin, agent).
        </p>
      </div>

      <div className="card overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4 font-semibold text-charcoal flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
                    {u.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4 text-gray-500">{u.country || 'India'}</td>
                <td className="py-3 px-4">
                  <select
                    value={u.role || 'tourist'}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="select-field text-xs py-1 px-2 border-gray-200"
                  >
                    <option value="tourist">Tourist / User</option>
                    <option value="admin">Administrator</option>
                    <option value="agent">Travel Agent</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
