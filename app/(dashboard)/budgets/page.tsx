'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import BudgetCard from '@/components/budgets/BudgetCard';
import EditBudgetDrawer from '@/components/budgets/EditBudgetDrawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Settings2, AlertCircle } from 'lucide-react';
import { toMonthString } from '@/lib/formatters';
import type { Metadata } from 'next';

interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED';
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(toMonthString());
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budgets/${month}/status`);
      setBudgets(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const exceededCount = budgets.filter((b) => b.status === 'EXCEEDED').length;
  const warningCount = budgets.filter((b) => b.status === 'WARNING').length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Budgets</h1>
          <p className="text-sm text-[#7B8399] mt-1">
            Monitor your spending limits
            {exceededCount > 0 && (
              <span className="ml-2 text-[#C0293E] font-medium">
                · {exceededCount} exceeded
              </span>
            )}
            {warningCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {warningCount} near limit
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            id="budget-month-picker"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40"
          />
          <Button
            onClick={() => setDrawerOpen(true)}
            variant="secondary"
            size="sm"
            id="edit-budgets-btn"
          >
            <Settings2 size={15} />
            Set Limits
          </Button>
        </div>
      </div>

      {/* Budget grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <AlertCircle size={36} className="text-[#E4E7EF] mb-3" />
          <p className="text-sm font-medium text-[#7B8399]">No budgets set for {month}</p>
          <p className="text-xs text-[#7B8399]/70 mt-1 mb-4">
            Set spending limits to track your budget
          </p>
          <Button onClick={() => setDrawerOpen(true)} size="sm">
            Set Budgets
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.category} budget={budget} />
          ))}
        </div>
      )}

      <EditBudgetDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        month={month}
        onSuccess={fetchBudgets}
        existingBudgets={budgets.map((b) => ({ category: b.category, limit: b.limit }))}
      />
    </div>
  );
}
