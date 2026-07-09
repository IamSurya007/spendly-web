'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatINR, formatRelative } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { Receipt, Landmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'expense' | 'loan';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  badge?: string;
}

export default function RecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/expenses', { params: { limit: 5, page: 1 } }),
        api.get('/loans', { params: { status: 'ACTIVE', limit: 5 } }),
      ]);

      const activityItems: ActivityItem[] = [];

      if (results[0].status === 'fulfilled') {
        const expenses = results[0].value.data?.data || results[0].value.data || [];
        (Array.isArray(expenses) ? expenses : []).slice(0, 5).forEach((e: {id: string; merchant?: string; category?: string; date?: string; createdAt?: string; amount?: number; method?: string}) => {
          activityItems.push({
            id: e.id,
            type: 'expense',
            title: e.merchant || e.category || 'Expense',
            subtitle: e.category || 'Uncategorized',
            amount: -(e.amount || 0),
            date: e.date || e.createdAt || new Date().toISOString(),
            badge: e.method,
          });
        });
      }

      if (results[1].status === 'fulfilled') {
        const loans = results[1].value.data?.data || results[1].value.data || [];
        (Array.isArray(loans) ? loans : []).slice(0, 5).forEach((l: {id: string; name?: string; type?: string; total?: number; principal?: number; status?: string; createdAt?: string}) => {
          activityItems.push({
            id: l.id,
            type: 'loan',
            title: l.name || 'Loan',
            subtitle: l.type === 'TAKEN' ? 'Borrowed' : 'Lent',
            amount: l.type === 'TAKEN' ? -(l.total || l.principal || 0) : (l.total || l.principal || 0),
            date: l.createdAt || new Date().toISOString(),
            badge: l.status,
          });
        });
      }

      // Sort by date, newest first
      activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(activityItems.slice(0, 8));
      setLoading(false);
    };

    fetchActivity();
  }, []);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#0D1B3E]">Recent Activity</h3>
        <Link
          href="/expenses"
          className="text-xs text-[#3D7FE8] hover:underline flex items-center gap-1"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="w-9 h-9" circle />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-1/4" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[#7B8399]">No recent activity</p>
          <p className="text-xs text-[#7B8399]/70 mt-1">
            Start by adding an expense or loan
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E4E7EF]">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 py-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'expense'
                    ? 'bg-[#C0293E]/10'
                    : 'bg-[#3D7FE8]/10'
                }`}
              >
                {item.type === 'expense' ? (
                  <Receipt size={15} className="text-[#C0293E]" />
                ) : (
                  <Landmark size={15} className="text-[#3D7FE8]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0D1B3E] truncate">{item.title}</p>
                <p className="text-xs text-[#7B8399]">
                  {item.subtitle} · {formatRelative(item.date)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    item.amount < 0 ? 'text-[#C0293E]' : 'text-[#1A7A4A]'
                  }`}
                >
                  {item.amount < 0 ? '-' : '+'}
                  {formatINR(Math.abs(item.amount))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
