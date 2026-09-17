'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatINR } from '@/lib/formatters';
import AccountModal from '@/components/accounts/AccountModal';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import {
  Plus,
  Landmark,
  CreditCard,
  Wallet,
  Pencil,
  Trash2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Account } from '@/types';

function argbToHex(argb?: number): string {
  if (!argb) return '#3D7FE8';
  // If argb is integer, extract RGB (mask out alpha)
  const hex = (argb & 0x00ffffff).toString(16).padStart(6, '0');
  return `#${hex}`;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      const data = res.data;
      setAccounts(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error('Failed to load accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Account deleted');
      fetchAccounts();
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  // Calculations
  const bankAccounts = accounts.filter((a) => a.type === 'bank' || a.type === 'cash' || a.type === 'wallet');
  const creditCards = accounts.filter((a) => a.type === 'credit_card');

  const totalLiquid = bankAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalCreditLimit = creditCards.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
  const totalCreditOwed = creditCards.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark size={20} />;
      case 'credit_card':
        return <CreditCard size={20} />;
      case 'wallet':
      case 'cash':
        return <Wallet size={20} />;
      default:
        return <Building2 size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'Bank';
      case 'credit_card': return 'Credit Card';
      case 'cash': return 'Cash';
      case 'wallet': return 'Wallet';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Accounts</h1>
          <p className="text-sm text-[#7B8399] mt-1">
            Manage your bank accounts, credit cards, cash and digital wallets
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setShowModal(true);
          }}
          size="sm"
          id="add-account-btn"
        >
          <Plus size={15} />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#7B8399]">Total Liquid Balance</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A7A4A]/10 text-[#1A7A4A]">
              <Landmark size={18} />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-28 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-xl font-bold text-[#1A7A4A]">
              {formatINR(totalLiquid)}
            </p>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#7B8399]">Total Credit Limit</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3D7FE8]/10 text-[#3D7FE8]">
              <CreditCard size={18} />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-28 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-xl font-bold text-[#3D7FE8]">
              {formatINR(totalCreditLimit)}
            </p>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#7B8399]">Credit Card Owed / Balance</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C0293E]/10 text-[#C0293E]">
              <ShieldCheck size={18} />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-28 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-xl font-bold text-[#0D1B3E]">
              {formatINR(totalCreditOwed)}
            </p>
          )}
        </div>
      </div>

      {/* Account List / Grid */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-[#0D1B3E] mb-4">Your Accounts</h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} lines={3} />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={36} className="text-[#E4E7EF] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#7B8399]">No accounts found</p>
            <p className="text-xs text-[#7B8399]/70 mt-1 mb-4">
              Add your bank accounts or credit cards to manage balances & payments
            </p>
            <Button
              onClick={() => {
                setEditingAccount(null);
                setShowModal(true);
              }}
              size="sm"
            >
              Add First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="accounts-grid">
            {accounts.map((acc) => {
              const hexColor = argbToHex(acc.colorValue);
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl border border-[#E4E7EF] bg-white hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: hexColor }}
                      >
                        {getAccountIcon(acc.type)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0D1B3E]">{acc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#7B8399] uppercase tracking-wider">
                            {getTypeLabel(acc.type)}
                          </span>
                          {acc.accountNumberLast4 && (
                            <span className="text-xs font-mono text-[#7B8399]">
                              •••• {acc.accountNumberLast4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(acc)}
                        className="p-1.5 rounded-lg hover:bg-[#EEF1F8] text-[#7B8399] hover:text-[#3D7FE8] transition-colors"
                        title="Edit Account"
                        aria-label="Edit Account"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        disabled={deletingId === acc.id}
                        className="p-1.5 rounded-lg hover:bg-[#C0293E]/10 text-[#7B8399] hover:text-[#C0293E] transition-colors disabled:opacity-50"
                        title="Delete Account"
                        aria-label="Delete Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E4E7EF] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#7B8399]">Current Balance</p>
                      <p className="text-base font-bold text-[#0D1B3E] mt-0.5">
                        {formatINR(acc.currentBalance || 0)}
                      </p>
                    </div>

                    {acc.type === 'credit_card' && (
                      <div className="text-right">
                        <p className="text-xs text-[#7B8399]">Credit Limit</p>
                        <p className="text-sm font-semibold text-[#3D7FE8] mt-0.5">
                          {formatINR(acc.creditLimit || 0)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AccountModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={fetchAccounts}
        account={editingAccount}
      />
    </div>
  );
}
