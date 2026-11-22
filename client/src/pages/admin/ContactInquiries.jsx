import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Mail, Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactInquiries() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await adminService.getMessages();
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminService.updateMessageStatus(id, status);
      if (res.data?.success) {
        toast.success(`Message marked as ${status}`);
        setMessages(messages.map((m) => (m._id === id ? { ...m, status } : m)));
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading inquiries..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="font-display text-2xl font-bold text-charcoal">Traveler Inquiries</h1>
        <p className="text-xs text-gray-500">
          Messages dispatched through the public contact desk.
        </p>
      </div>

      {messages.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No inquiries received yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className="card p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {msg.status || 'new'}
                  </span>
                  <h3 className="font-display text-base font-bold text-charcoal mt-1">
                    {msg.subject}
                  </h3>
                  <p className="text-xs text-gray-400">
                    From: {msg.name} ({msg.email}) &bull;{' '}
                    {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {msg.status !== 'replied' && (
                    <button
                      onClick={() => handleStatusChange(msg._id, 'replied')}
                      className="btn-secondary text-xs py-1 px-3"
                    >
                      Mark Replied
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
