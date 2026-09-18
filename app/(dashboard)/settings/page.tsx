'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SheetsWidget from '@/components/settings/SheetsWidget';
import FCMToggle from '@/components/settings/FCMToggle';
import SyncButton from '@/components/dashboard/SyncButton';
import Button from '@/components/ui/Button';
import { Shield, Info, Key, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [copying, setCopying] = useState(false);

  const handleCopyToken = async () => {
    if (!user) {
      toast.error('No authenticated user found');
      return;
    }
    setCopying(true);
    try {
      const token = await user.getIdToken(true);
      console.log('--- FISCORA FIREBASE ID TOKEN ---');
      console.log(token);
      console.log('---------------------------------');
      await navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard & logged to console!');
    } catch (err) {
      toast.error('Failed to get auth token');
      console.error(err);
    } finally {
      setCopying(false);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0D1B3E]">Settings</h1>
        <p className="text-sm text-[#7B8399] mt-1">Manage your account and integrations</p>
      </div>

      {/* Profile card */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-[#0D1B3E] mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-14 h-14 rounded-2xl ring-2 ring-[#E4E7EF]"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#3D7FE8] flex items-center justify-center text-white text-xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-[#0D1B3E]">{displayName}</p>
            <p className="text-sm text-[#7B8399]">{user?.email}</p>
            <p className="text-xs text-[#7B8399]/70 mt-0.5">
              UID: {user?.uid?.slice(0, 12)}...
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h2 className="text-sm font-semibold text-[#7B8399] uppercase tracking-wide mb-3 px-1">
          Notifications
        </h2>
        <FCMToggle />
      </div>

      {/* Google Sheets */}
      <div>
        <h2 className="text-sm font-semibold text-[#7B8399] uppercase tracking-wide mb-3 px-1">
          Integrations
        </h2>
        <div className="space-y-3">
          <SheetsWidget />
          <SyncButton />
        </div>
      </div>

      {/* Developer Options */}
      <div>
        <h2 className="text-sm font-semibold text-[#7B8399] uppercase tracking-wide mb-3 px-1">
          Developer Options
        </h2>
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#3D7FE8]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Key size={18} className="text-[#3D7FE8]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B3E]">Firebase ID Token</p>
                <p className="text-xs text-[#7B8399] mt-1 leading-relaxed">
                  Copy your active Firebase ID Token to test API endpoints in Postman, Swagger, or curl.
                  The token is also logged to your browser's developer console.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyToken}
              loading={copying}
              className="flex-shrink-0 gap-1.5"
              id="copy-token-btn"
            >
              <Copy size={14} />
              Copy Token
            </Button>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="card p-5 border-[#3D7FE8]/30 bg-[#3D7FE8]/5">
        <div className="flex gap-3">
          <Info size={18} className="text-[#3D7FE8] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0D1B3E]">About Database Setup</p>
            <p className="text-xs text-[#7B8399] mt-1 leading-relaxed">
              The NestJS backend uses TypeORM with <code className="bg-[#E4E7EF] px-1 py-0.5 rounded">synchronize: true</code>.
              Upon creating your first user account, the backend automatically creates all required PostgreSQL tables.
              No manual migration is needed.
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-[#7B8399] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0D1B3E]">Security</p>
            <p className="text-xs text-[#7B8399] mt-1">
              Authentication is handled by Firebase. Your data is protected with Firebase ID tokens
              refreshed every hour. All API calls require a valid Bearer token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
