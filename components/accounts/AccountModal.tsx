'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Account } from '@/types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account?: Account | null;
}

const accountTypeOptions = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'wallet', label: 'Digital Wallet' },
];

const presetColors = [
  { label: 'Blue', value: 4282204136, hex: '#3D7FE8' },
  { label: 'Emerald', value: 4280015434, hex: '#1A7A4A' },
  { label: 'Red', value: 4290840894, hex: '#C0293E' },
  { label: 'Purple', value: 4287106042, hex: '#8B5CF6' },
  { label: 'Amber', value: 4294218760, hex: '#F59E0B' },
  { label: 'Slate', value: 4283060121, hex: '#475569' },
];

export default function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
}: AccountModalProps) {
  const isEdit = !!account?.id;
  const [form, setForm] = useState({
    name: '',
    type: 'bank' as 'bank' | 'credit_card' | 'cash' | 'wallet',
    currentBalance: '',
    creditLimit: '',
    accountNumberLast4: '',
    colorValue: presetColors[0].value,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || '',
        type: account.type || 'bank',
        currentBalance: account.currentBalance !== undefined ? account.currentBalance.toString() : '0',
        creditLimit: account.creditLimit !== undefined ? account.creditLimit.toString() : '0',
        accountNumberLast4: account.accountNumberLast4 || '',
        colorValue: account.colorValue || presetColors[0].value,
      });
    } else {
      setForm({
        name: '',
        type: 'bank',
        currentBalance: '0',
        creditLimit: '0',
        accountNumberLast4: '',
        colorValue: presetColors[0].value,
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Account name is required';
    if (form.currentBalance === '' || isNaN(Number(form.currentBalance))) {
      errs.currentBalance = 'Valid balance is required';
    }
    if (form.type === 'credit_card') {
      if (form.creditLimit === '' || isNaN(Number(form.creditLimit))) {
        errs.creditLimit = 'Valid credit limit is required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: Partial<Account> = {
        name: form.name.trim(),
        type: form.type,
        currentBalance: Number(form.currentBalance),
        creditLimit: form.type === 'credit_card' ? Number(form.creditLimit) : 0,
        accountNumberLast4: form.accountNumberLast4.trim() || undefined,
        colorValue: form.colorValue,
      };

      if (isEdit) {
        await api.patch(`/accounts/${account!.id}`, payload);
        toast.success('Account updated!');
      } else {
        await api.post('/accounts', payload);
        toast.success('Account created!');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Account' : 'Add New Account'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="account-name"
          label="Account Name"
          placeholder="e.g. HDFC Bank, ICICI Credit Card, Salary Account"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="account-type"
            label="Account Type"
            options={accountTypeOptions}
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value as 'bank' | 'credit_card' | 'cash' | 'wallet',
              })
            }
          />
          <Input
            id="account-last4"
            label="Last 4 Digits (optional)"
            placeholder="e.g. 4321"
            maxLength={4}
            value={form.accountNumberLast4}
            onChange={(e) => setForm({ ...form, accountNumberLast4: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="account-balance"
            label="Current Balance (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.currentBalance}
            onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
            error={errors.currentBalance}
            required
          />
          {form.type === 'credit_card' ? (
            <Input
              id="account-limit"
              label="Credit Limit (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.creditLimit}
              onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
              error={errors.creditLimit}
              required
            />
          ) : (
            <div className="flex flex-col justify-end">
              <label className="text-xs font-medium text-[#7B8399] mb-1">Color Theme</label>
              <div className="flex items-center gap-2 py-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setForm({ ...form, colorValue: color.value })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      form.colorValue === color.value ? 'scale-110 border-[#0D1B3E]' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {form.type === 'credit_card' && (
          <div>
            <label className="text-xs font-medium text-[#7B8399] mb-1">Color Theme</label>
            <div className="flex items-center gap-2 py-1">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setForm({ ...form, colorValue: color.value })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    form.colorValue === color.value ? 'scale-110 border-[#0D1B3E]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}

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
          <Button type="submit" fullWidth loading={loading} id="account-submit-btn">
            {isEdit ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
