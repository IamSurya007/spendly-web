'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import LoanModal from '@/components/loans/LoanModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import Select from '@/components/ui/Select';
import { formatINR, formatDate, daysRemaining } from '@/lib/formatters';
import { Plus, Landmark, TrendingUp, TrendingDown, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Loan } from '@/types';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIAL', label: 'Partial' },
];

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalOwed: 0, totalReceivable: 0 });

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const [loansRes, summaryRes] = await Promise.all([
        api.get('/loans'),
        api.get('/loans/summary'),
      ]);
      setLoans(Array.isArray(loansRes.data) ? loansRes.data : loansRes.data?.data || []);
      setSummary(summaryRes.data || { totalOwed: 0, totalReceivable: 0 });
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/loans/${id}`, { status });
      toast.success('Status updated');
      fetchLoans();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/loans/${id}`);
      toast.success('Loan deleted');
      fetchLoans();
    } catch {
      toast.error('Failed to delete loan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLoan(null);
  };

  const netPosition = summary.totalReceivable - summary.totalOwed;
  const upcomingLoans = loans
    .filter((l) => l.status === 'ACTIVE' && l.repaymentDate)
    .sort((a, b) => new Date(a.repaymentDate!).getTime() - new Date(b.repaymentDate!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Loans</h1>
          <p className="text-sm text-[#7B8399] mt-1">Track borrowed and lent money</p>
        </div>
        <Button
          onClick={() => {
            setEditingLoan(null);
            setShowModal(true);
          }}
          size="sm"
          id="add-loan-btn"
        >
          <Plus size={15} />
          Add Loan
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Owed', value: summary.totalOwed, icon: <TrendingDown size={18} className="text-[#C0293E]" />, color: '#C0293E' },
          { label: 'Total Receivable', value: summary.totalReceivable, icon: <TrendingUp size={18} className="text-[#1A7A4A]" />, color: '#1A7A4A' },
          { label: 'Net Position', value: Math.abs(netPosition), icon: <Landmark size={18} className="text-[#3D7FE8]" />, color: netPosition >= 0 ? '#1A7A4A' : '#C0293E', prefix: netPosition >= 0 ? '+' : '-' },
        ].map(({ label, value, icon, color, prefix = '' }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#7B8399]">{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                {icon}
              </div>
            </div>
            {loading ? <Skeleton className="h-7 w-28" /> : (
              <p className="text-xl font-bold" style={{ color }}>
                {prefix}{formatINR(value)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Loans table */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-[#0D1B3E] mb-4">All Loans</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={32} className="text-[#E4E7EF] mx-auto mb-2" />
              <p className="text-sm text-[#7B8399]">No loans yet</p>
            </div>
          ) : (
            <div className="space-y-2" id="loans-list">
              {loans.map((loan) => {
                const days = loan.repaymentDate ? daysRemaining(loan.repaymentDate) : null;
                return (
                  <div key={loan.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F0F2F6] hover:bg-[#EEF1F8] transition-colors group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${loan.type === 'TAKEN' ? 'bg-[#C0293E]/10' : 'bg-[#1A7A4A]/10'}`}>
                      {loan.type === 'TAKEN'
                        ? <TrendingDown size={14} className="text-[#C0293E]" />
                        : <TrendingUp size={14} className="text-[#1A7A4A]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D1B3E] truncate">{loan.name}</p>
                      <p className="text-xs text-[#7B8399]">
                        {loan.type === 'TAKEN' ? 'I owe' : 'They owe me'} ·{' '}
                        {loan.repaymentDate && `Due ${formatDate(loan.repaymentDate)}`}
                      </p>
                    </div>
                    <div className="text-right mr-1">
                      <p className={`text-sm font-bold ${loan.type === 'TAKEN' ? 'text-[#C0293E]' : 'text-[#1A7A4A]'}`}>
                        {formatINR(loan.total)}
                      </p>
                      {days !== null && (
                        <p className={`text-xs ${days < 0 ? 'text-[#C0293E]' : days <= 7 ? 'text-amber-600' : 'text-[#7B8399]'}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                        </p>
                      )}
                    </div>
                    <div className="w-28 flex-shrink-0">
                      <Select
                        id={`loan-status-${loan.id}`}
                        options={statusOptions}
                        value={loan.status}
                        onChange={(e) => handleStatusChange(loan.id, e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(loan)}
                        className="p-1.5 rounded-lg hover:bg-[#EEF1F8] text-[#7B8399] hover:text-[#3D7FE8] transition-colors"
                        title="Edit loan"
                        aria-label="Edit loan"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(loan.id)}
                        disabled={deletingId === loan.id}
                        className="p-1.5 rounded-lg hover:bg-[#C0293E]/10 text-[#7B8399] hover:text-[#C0293E] transition-colors disabled:opacity-50"
                        title="Delete loan"
                        aria-label="Delete loan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming repayments */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#0D1B3E] mb-4">Upcoming Repayments</h3>
          {upcomingLoans.length === 0 ? (
            <p className="text-sm text-[#7B8399] text-center py-4">No upcoming repayments</p>
          ) : (
            <div className="space-y-3">
              {upcomingLoans.map((loan) => {
                const days = daysRemaining(loan.repaymentDate!);
                return (
                  <div key={loan.id} className="flex items-center justify-between py-2 border-b border-[#E4E7EF] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#0D1B3E]">{loan.name}</p>
                      <p className="text-xs text-[#7B8399]">{formatINR(loan.total)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      days < 0 ? 'bg-[#C0293E]/10 text-[#C0293E]' :
                      days <= 7 ? 'bg-amber-100 text-amber-700' :
                      'bg-[#1A7A4A]/10 text-[#1A7A4A]'
                    }`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <LoanModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={fetchLoans}
        loan={editingLoan}
      />
    </div>
  );
}
