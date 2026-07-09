'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatINR, toMonthString } from '@/lib/formatters';
import ExpenseTable from '@/components/expenses/ExpenseTable';
import ExpenseModal from '@/components/expenses/ExpenseModal';
import ExpenseFilters from '@/components/expenses/ExpenseFilters';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import type { Metadata } from 'next';

interface Expense {
  id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  method: string;
  source: string;
  merchant?: string;
}

interface ExpenseSummary {
  totalExpenses: number;
  totalIncome?: number;
  balance?: number;
}

export default function ExpensesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    source: '',
    month: toMonthString(),
  });

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get('/expenses/summary', {
        params: { month: filters.month },
      });
      setSummary(res.data);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.month]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
    fetchSummary();
  };

  const balance = (summary?.totalIncome ?? 0) - (summary?.totalExpenses ?? 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Expenses</h1>
          <p className="text-sm text-[#7B8399] mt-1">Track and manage your spending</p>
        </div>
        <Button
          onClick={() => { setEditingExpense(null); setShowModal(true); }}
          id="add-expense-btn"
          size="sm"
        >
          <Plus size={15} />
          Add Expense
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Expenses',
            value: summaryLoading ? null : summary?.totalExpenses ?? 0,
            icon: <TrendingDown size={18} className="text-[#C0293E]" />,
            color: '#C0293E',
            negative: true,
          },
          {
            label: 'Total Income',
            value: summaryLoading ? null : summary?.totalIncome ?? 0,
            icon: <TrendingUp size={18} className="text-[#1A7A4A]" />,
            color: '#1A7A4A',
            negative: false,
          },
          {
            label: 'Balance',
            value: summaryLoading ? null : balance,
            icon: <Wallet size={18} className="text-[#3D7FE8]" />,
            color: balance >= 0 ? '#1A7A4A' : '#C0293E',
            negative: balance < 0,
          },
        ].map(({ label, value, icon, color, negative }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#7B8399]">{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                {icon}
              </div>
            </div>
            {value === null ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className="text-xl font-bold" style={{ color }}>
                {negative && value !== 0 ? '-' : ''}{formatINR(Math.abs(value as number))}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <ExpenseFilters filters={filters} onChange={setFilters} />
        </div>
        <ExpenseTable filters={filters} onEdit={handleEdit} refreshKey={refreshKey} />
      </div>

      <ExpenseModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        expense={editingExpense}
      />
    </div>
  );
}
