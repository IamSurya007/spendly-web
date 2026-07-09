'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setSynced(false);
    try {
      await api.post('/sheets/sync');
      setSynced(true);
      toast.success('Google Sheets synced successfully!');
      setTimeout(() => setSynced(false), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Sync failed. Check your Sheets connection in Settings.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-[#0D1B3E]">Google Sheets Sync</h3>
        <p className="text-xs text-[#7B8399] mt-0.5">
          Manually push your latest data to Google Sheets
        </p>
      </div>
      <Button
        onClick={handleSync}
        loading={loading}
        variant={synced ? 'secondary' : 'primary'}
        size="sm"
        id="sheets-sync-btn"
        className={synced ? 'text-[#1A7A4A]' : ''}
      >
        {synced ? (
          <>
            <CheckCircle2 size={14} />
            Synced
          </>
        ) : (
          <>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Sync Now
          </>
        )}
      </Button>
    </div>
  );
}
