'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/formatters';
import {
  Sheet, CheckCircle2, XCircle, ExternalLink, Unlink, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface SheetsStatus {
  connected: boolean;
  sheetsId?: string;
  lastSynced?: string;
  sheetUrl?: string;
}

export default function SheetsWidget() {
  const [status, setStatus] = useState<SheetsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetsId, setSheetsId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sheets/status');
      setStatus(res.data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Load initial connection status
    fetchStatus();

    // 2. Check for Google OAuth callback parameters
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      handleExchangeCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExchangeCode = async (authCode: string) => {
    setConnecting(true);
    const toastId = toast.loading('Exchanging authorization code...');

    try {
      const savedSheetsId = localStorage.getItem('fiscora_sheets_id') || localStorage.getItem('spendly_sheets_id');
      if (!savedSheetsId) {
        throw new Error('Spreadsheet ID missing from session. Please try connecting again.');
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured in frontend .env.local');
      }

      // Redirect URI must match the one sent to the authorize endpoint exactly
      const redirectUri = `${window.location.origin}/settings`;

      // Request token from Google
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const { refresh_token } = tokenResponse.data;
      if (!refresh_token) {
        throw new Error('No refresh token returned. Revoke access from Google settings and try again.');
      }

      // Send refresh token to NestJS backend under sheetsToken
      await api.post('/sheets/connect', {
        sheetsId: savedSheetsId,
        sheetsToken: refresh_token,
      });

      toast.success('Successfully connected Google Sheets!', { id: toastId });
      localStorage.removeItem('fiscora_sheets_id');
      localStorage.removeItem('spendly_sheets_id');

      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchStatus();
    } catch (err: any) {
      const errMsg = err.response?.data?.error_description || err.message || 'Failed to exchange authorization code';
      toast.error(errMsg, { id: toastId });
      console.error('[Google OAuth Exchange Error]:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetsId) {
      toast.error('Please enter a valid Google Spreadsheet ID');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Client ID not configured in environment variables');
      return;
    }

    // Save sheetsId locally before redirecting so we can retrieve it upon return
    localStorage.setItem('fiscora_sheets_id', sheetsId);

    const redirectUri = `${window.location.origin}/settings`;
    const scope = 'https://www.googleapis.com/auth/spreadsheets';

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    // Redirect to Google Consent screen
    window.location.href = oauthUrl;
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Sheets?')) return;
    setDisconnecting(true);
    try {
      await api.delete('/sheets/disconnect');
      toast.success('Google Sheets disconnected');
      fetchStatus();
    } catch {
      toast.error('Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-5 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A7A4A]/10 rounded-xl flex items-center justify-center">
            <Sheet size={20} className="text-[#1A7A4A]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0D1B3E]">Google Sheets</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {status?.connected ? (
                <>
                  <CheckCircle2 size={12} className="text-[#1A7A4A]" />
                  <span className="text-xs text-[#1A7A4A]">Connected</span>
                </>
              ) : (
                <>
                  <XCircle size={12} className="text-[#7B8399]" />
                  <span className="text-xs text-[#7B8399]">Not connected</span>
                </>
              )}
            </div>
          </div>
        </div>
        {status?.connected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            loading={disconnecting}
            className="text-[#C0293E]"
            id="sheets-disconnect-btn"
          >
            <Unlink size={14} />
            Disconnect
          </Button>
        )}
      </div>

      {status?.connected ? (
        <div className="space-y-3">
          <div className="bg-[#F0F2F6] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7B8399]">Spreadsheet ID</span>
              <span className="text-xs font-mono text-[#0D1B3E] truncate max-w-[200px]">
                {status.sheetsId}
              </span>
            </div>
            {status.lastSynced && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7B8399]">Last synced</span>
                <span className="text-xs text-[#0D1B3E]">{formatDate(status.lastSynced)}</span>
              </div>
            )}
          </div>
          {status.sheetUrl && (
            <a
              href={status.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#3D7FE8] hover:underline"
            >
              <ExternalLink size={12} />
              Open spreadsheet
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={handleConnectInitiate} className="space-y-3">
          <p className="text-xs text-[#7B8399]">
            Enter your Google Spreadsheet ID. You will be redirected to Google to authorize access.
          </p>
          <Input
            id="sheets-id-input"
            label="Spreadsheet ID"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            value={sheetsId}
            onChange={(e) => setSheetsId(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={connecting} id="sheets-connect-btn">
            <RefreshCw size={14} className={connecting ? 'animate-spin' : ''} />
            Authorize & Connect Sheets
          </Button>
        </form>
      )}
    </div>
  );
}
