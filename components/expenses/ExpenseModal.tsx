'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Account, Expense } from '@/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null; // if provided, we're editing
}

const methodOptions = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'NET_BANKING', label: 'Net Banking' },
  { value: 'CHEQUE', label: 'Cheque' },
];

const commonCategories = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Other',
];

const categoryOptions = commonCategories.map((c) => ({ value: c, label: c }));

function toInputDate(dateStr?: string) {
  if (!dateStr) return new Date().toISOString().slice(0, 16);
  return new Date(dateStr).toISOString().slice(0, 16);
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expense,
}: ExpenseModalProps) {
  const isEdit = !!expense?.id;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({
    amount: '',
    category: '',
    note: '',
    date: toInputDate(),
    method: 'UPI',
    merchant: '',
    source: 'MANUAL',
    accountId: 'default_bank',
    isCountedAsSpend: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Fetch accounts for selector
      api
        .get('/accounts')
        .then((res) => {
          const accs = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setAccounts(accs);
        })
        .catch(() => {
          setAccounts([]);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (expense) {
      const spendFlag =
        expense.isCountedAsSpend !== undefined
          ? expense.isCountedAsSpend
          : expense.is_counted_as_spend !== undefined
          ? expense.is_counted_as_spend
          : true;

      setForm({
        amount: expense.amount?.toString() || '',
        category: expense.category || '',
        note: expense.note || '',
        date: toInputDate(expense.date),
        method: expense.method || 'UPI',
        merchant: expense.merchant || '',
        source: expense.source || 'MANUAL',
        accountId: expense.accountId || 'default_bank',
        isCountedAsSpend: spendFlag,
      });
    } else {
      setForm({
        amount: '',
        category: '',
        note: '',
        date: toInputDate(),
        method: 'UPI',
        merchant: '',
        source: 'MANUAL',
        accountId: 'default_bank',
        isCountedAsSpend: true,
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Valid amount is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        amount: Number(form.amount),
        category: form.category,
        note: form.note || undefined,
        date: new Date(form.date).toISOString(),
        method: form.method,
        merchant: form.merchant || undefined,
        source: form.source,
        accountId: form.accountId || 'default_bank',
        isCountedAsSpend: form.isCountedAsSpend,
        is_counted_as_spend: form.isCountedAsSpend,
      };

      if (isEdit) {
        await api.patch(`/expenses/${expense!.id}`, payload);
        toast.success('Expense updated!');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense added!');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save expense';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = [
    { value: 'default_bank', label: 'Default Bank Account' },
    ...accounts.map((a) => ({
      value: a.id,
      label: `${a.name}${a.accountNumberLast4 ? ` (•••• ${a.accountNumberLast4})` : ''}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Expense' : 'Add Expense'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="expense-amount"
            label="Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            error={errors.amount}
            required
          />
          <Input
            id="expense-merchant"
            label="Merchant (optional)"
            type="text"
            placeholder="e.g. Zomato"
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="expense-category"
            label="Category"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Select category"
            error={errors.category}
            required
          />
          <Select
            id="expense-account"
            label="Account / Payment Source"
            options={accountOptions}
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="expense-method"
            label="Payment Method"
            options={methodOptions}
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
          />
          <Input
            id="expense-date"
            label="Date & Time"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            error={errors.date}
            required
          />
        </div>

        <Input
          id="expense-note"
          label="Note (optional)"
          type="text"
          placeholder="Add a note..."
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        {/* Count as Spend Toggle */}
        <div className="flex items-center gap-2 pt-1 pb-1">
          <input
            id="expense-count-as-spend"
            type="checkbox"
            checked={form.isCountedAsSpend}
            onChange={(e) => setForm({ ...form, isCountedAsSpend: e.target.checked })}
            className="w-4 h-4 rounded border-[#E4E7EF] text-[#3D7FE8] focus:ring-[#3D7FE8]"
          />
          <label htmlFor="expense-count-as-spend" className="text-xs font-medium text-[#0D1B3E] cursor-pointer">
            Count as spend (include in monthly totals & budget alert calculations)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading} id="expense-submit-btn">
            {isEdit ? 'Update' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
