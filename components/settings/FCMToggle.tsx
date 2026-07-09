'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FCMToggle() {
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(
    typeof window !== 'undefined' && Notification?.permission === 'granted'
  );

  const handleEnable = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // In production, you'd get the actual FCM token from firebase/messaging
        // For now, we'll send a placeholder to trigger the PATCH
        await api.patch('/users/me/fcm', { fcmToken: 'browser-notification-enabled' });
        setGranted(true);
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
    } catch {
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${granted ? 'bg-[#1A7A4A]/10' : 'bg-[#F0F2F6]'}`}>
          {granted
            ? <Bell size={18} className="text-[#1A7A4A]" />
            : <BellOff size={18} className="text-[#7B8399]" />
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0D1B3E]">Push Notifications</p>
          <p className="text-xs text-[#7B8399]">
            {granted ? 'Notifications are enabled' : 'Enable to receive alerts'}
          </p>
        </div>
      </div>
      {!granted && (
        <button
          onClick={handleEnable}
          disabled={loading}
          className="text-sm font-medium text-[#3D7FE8] hover:text-[#2d6fd8] disabled:opacity-50 transition-colors"
          id="fcm-enable-btn"
        >
          {loading ? 'Enabling...' : 'Enable'}
        </button>
      )}
    </div>
  );
}
