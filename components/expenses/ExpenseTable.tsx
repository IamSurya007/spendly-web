'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatINR, formatDate } from '@/lib/formatters';
import { SkeletonTable } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface ExpenseTableProps {
  filters: { category?: string; source?: string; month?: string };
  onEdit: (expense: Expense) => void;
  refreshKey: number;
}

const methodColors: Record<string, 'default' | 'paid' | 'ok'> = {
  CASH: 'default',
  UPI: 'paid',
  CARD: 'ok',
  NET_BANKING: 'default',
  CHEQUE: 'default',
};

export default function ExpenseTable({ filters, onEdit, refreshKey }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const limit = 15;

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filters.category) params.category = filters.category;
      if (filters.source) params.source = filters.source;
      if (filters.month) params.month = filters.month;

      const res = await api.get('/expenses', { params });
      const data = res.data;
      setExpenses(Array.isArray(data) ? data : data.data || []);
      setTotal(data.total || data.count || 0);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SkeletonTable rows={8} cols={5} />;

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-[#E4E7EF] mb-3" />
        <p className="text-sm font-medium text-[#7B8399]">No expenses found</p>
        <p className="text-xs text-[#7B8399]/70 mt-1">
          Try adjusting your filters or add a new expense
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" id="expenses-table">
          <thead>
            <tr className="border-b border-[#E4E7EF]">
              {['Date', 'Merchant / Note', 'Category', 'Method', 'Amount', ''].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-[#7B8399] py-3 px-2 first:pl-0 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EF]">
            {expenses.map((expense) => (
              <tr key={expense.id} className="group hover:bg-[#ECEEF4]/50 transition-colors">
                <td className="py-3 px-2 pl-0 text-xs text-[#7B8399] whitespace-nowrap">
                  {formatDate(expense.date)}
                </td>
                <td className="py-3 px-2">
                  <p className="font-medium text-[#0D1B3E]">
                    {expense.merchant || expense.category}
                  </p>
                  {expense.note && (
                    <p className="text-xs text-[#7B8399] truncate max-w-[200px]">{expense.note}</p>
                  )}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs bg-[#EEF1F8] text-[#0D1B3E] px-2 py-1 rounded-md">
                    {expense.category}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <Badge variant={methodColors[expense.method] || 'default'}>
                    {expense.method}
                  </Badge>
                </td>
                <td className="py-3 px-2 font-semibold text-[#C0293E] whitespace-nowrap">
                  -{formatINR(expense.amount)}
                </td>
                <td className="py-3 px-2 pr-0">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1.5 rounded-lg hover:bg-[#EEF1F8] text-[#7B8399] hover:text-[#3D7FE8] transition-colors"
                      aria-label="Edit expense"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="p-1.5 rounded-lg hover:bg-[#C0293E]/10 text-[#7B8399] hover:text-[#C0293E] transition-colors disabled:opacity-50"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EF] mt-4">
          <p className="text-xs text-[#7B8399]">
            Page {page} of {totalPages} · {total} expenses
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
