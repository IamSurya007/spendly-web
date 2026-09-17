'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import InvestmentModal from '@/components/investments/InvestmentModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatINR, formatDate, daysRemaining } from '@/lib/formatters';
import { Plus, TrendingUp, PiggyBank, Target, AlertCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Investment } from '@/types';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalPrincipal: 0, totalMaturityValue: 0 });

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const [invRes, sumRes] = await Promise.all([
        api.get('/investments'),
        api.get('/investments/summary'),
      ]);
      setInvestments(Array.isArray(invRes.data) ? invRes.data : invRes.data?.data || []);
      setSummary(sumRes.data || { totalPrincipal: 0, totalMaturityValue: 0 });
    } catch {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvestments(); }, []);

  const handleEdit = (inv: Investment) => {
    setEditingInvestment(inv);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/investments/${id}`);
      toast.success('Investment deleted');
      fetchInvestments();
    } catch {
      toast.error('Failed to delete investment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvestment(null);
  };

  // Maturing in next 30 days
  const maturingSoon = investments.filter((inv) => {
    if (!inv.maturityDate) return false;
    const days = daysRemaining(inv.maturityDate);
    return days >= 0 && days <= 30;
  });

  const typeColorMap: Record<string, string> = {
    RD: '#3D7FE8', SIP: '#1A7A4A', MF: '#1A7A4A',
    FD: '#C0293E', PPF: '#7B8399', OTHER: '#7B8399',
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Investments</h1>
          <p className="text-sm text-[#7B8399] mt-1">Monitor your investment portfolio</p>
        </div>
        <Button
          onClick={() => {
            setEditingInvestment(null);
            setShowModal(true);
          }}
          size="sm"
          id="add-investment-btn"
        >
          <Plus size={15} />
          Add Investment
        </Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Principal', value: summary.totalPrincipal, icon: <PiggyBank size={18} className="text-[#3D7FE8]" />, color: '#3D7FE8' },
          { label: 'Expected Maturity', value: summary.totalMaturityValue, icon: <Target size={18} className="text-[#1A7A4A]" />, color: '#1A7A4A' },
          {
            label: 'Expected Returns',
            value: summary.totalMaturityValue - summary.totalPrincipal,
            icon: <TrendingUp size={18} className="text-[#1A7A4A]" />,
            color: '#1A7A4A',
          },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#7B8399]">{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                {icon}
              </div>
            </div>
            {loading ? <Skeleton className="h-7 w-28" /> : (
              <p className="text-xl font-bold" style={{ color }}>
                {formatINR(value)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Investments list */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-[#0D1B3E] mb-4">All Investments</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={32} className="text-[#E4E7EF] mx-auto mb-2" />
              <p className="text-sm text-[#7B8399]">No investments yet</p>
            </div>
          ) : (
            <div className="space-y-3" id="investments-list">
              {investments.map((inv) => (
                <div key={inv.id} className="p-3 rounded-xl bg-[#F0F2F6] hover:bg-[#EEF1F8] transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: typeColorMap[inv.type] || '#7B8399' }}
                      >
                        {inv.type}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0D1B3E]">
                          {inv.institution || inv.type}
                        </p>
                        <p className="text-xs text-[#7B8399]">
                          {inv.durationMonths && `${inv.durationMonths} months`}
                          {inv.interestRate && ` · ${inv.interestRate}% p.a.`}
                          {inv.startDate && ` · Started ${formatDate(inv.startDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0D1B3E]">
                          {formatINR(inv.maturityAmount || inv.principal || 0)}
                        </p>
                        <p className="text-xs text-[#7B8399]">
                          Principal: {formatINR(inv.principal || inv.monthlyAmount || 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(inv)}
                          className="p-1.5 rounded-lg hover:bg-[#EEF1F8] text-[#7B8399] hover:text-[#3D7FE8] transition-colors"
                          title="Edit investment"
                          aria-label="Edit investment"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          disabled={deletingId === inv.id}
                          className="p-1.5 rounded-lg hover:bg-[#C0293E]/10 text-[#7B8399] hover:text-[#C0293E] transition-colors disabled:opacity-50"
                          title="Delete investment"
                          aria-label="Delete investment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {inv.maturityDate && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#7B8399]">
                      <Clock size={11} />
                      Matures {formatDate(inv.maturityDate)}
                      {daysRemaining(inv.maturityDate) <= 30 && daysRemaining(inv.maturityDate) >= 0 && (
                        <span className="ml-1 text-amber-600 font-medium">
                          (in {daysRemaining(inv.maturityDate)}d)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maturing soon */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#0D1B3E] mb-1">Maturing Soon</h3>
          <p className="text-xs text-[#7B8399] mb-4">Within the next 30 days</p>
          {maturingSoon.length === 0 ? (
            <p className="text-sm text-[#7B8399] text-center py-4">
              No investments maturing soon
            </p>
          ) : (
            <div className="space-y-3">
              {maturingSoon.map((inv) => {
                const days = daysRemaining(inv.maturityDate!);
                return (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-[#E4E7EF] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#0D1B3E]">
                        {inv.institution || inv.type}
                      </p>
                      <p className="text-xs text-[#7B8399]">{formatINR(inv.maturityAmount || 0)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      days <= 7 ? 'bg-[#C0293E]/10 text-[#C0293E]' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {days === 0 ? 'Today' : `${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <InvestmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={fetchInvestments}
        investment={editingInvestment}
      />
    </div>
  );
}
