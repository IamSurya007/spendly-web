import type { Metadata } from 'next';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import SyncButton from '@/components/dashboard/SyncButton';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0D1B3E]">Dashboard</h1>
        <p className="text-sm text-[#7B8399] mt-1">
          Overview of your financial health
        </p>
      </div>

      {/* Summary cards */}
      <SummaryCards />

      {/* Activity + Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-4">
          <SyncButton />
          {/* Quick tips card */}
          <div className="card p-5 bg-gradient-to-br from-[#3D7FE8] to-[#2460c0] text-white border-0">
            <p className="text-xs font-medium text-white/70 mb-1">Pro Tip</p>
            <p className="text-sm font-semibold">Connect Google Sheets</p>
            <p className="text-xs text-white/70 mt-1.5">
              Keep a backup of all your data in a spreadsheet you own.
            </p>
            <a
              href="/settings"
              className="inline-block mt-3 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Set up in Settings →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
