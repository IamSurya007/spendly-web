'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const typeOptions = [
  { value: 'RD', label: 'Recurring Deposit (RD)' },
  { value: 'SIP', label: 'SIP' },
  { value: 'MF', label: 'Mutual Fund (MF)' },
  { value: 'FD', label: 'Fixed Deposit (FD)' },
  { value: 'PPF', label: 'PPF' },
  { value: 'OTHER', label: 'Other' },
];

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function calcRDMaturity(monthly: number, months: number, rate: number): number {
  // Standard RD maturity formula: M * [(1+r/4)^(4n) - 1] / (1-(1+r/4)^(-1/3))
  // Simplified: approximate
  if (!monthly || !months || !rate) return 0;
  const r = rate / 100 / 4;
  const n = months / 3;
  return Math.round(monthly * (Math.pow(1 + r, n) - 1) / (1 - Math.pow(1 + r, -1 / 3)));
}

export default function InvestmentModal({ isOpen, onClose, onSuccess }: InvestmentModalProps) {
  const [form, setForm] = useState({
    type: 'RD',
    monthlyAmount: '',
    principal: '',
    durationMonths: '',
    interestRate: '',
    startDate: '',
    maturityDate: '',
    maturityAmount: '',
    institution: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        type: 'RD', monthlyAmount: '', principal: '', durationMonths: '',
        interestRate: '', startDate: '', maturityDate: '', maturityAmount: '', institution: '',
      });
    }
  }, [isOpen]);

  // Auto-calculate maturity for RD
  useEffect(() => {
    if (form.type === 'RD' && form.monthlyAmount && form.durationMonths && form.interestRate && !form.maturityAmount) {
      const calc = calcRDMaturity(
        Number(form.monthlyAmount),
        Number(form.durationMonths),
        Number(form.interestRate)
      );
      if (calc > 0) setForm((f) => ({ ...f, maturityAmount: calc.toString() }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.monthlyAmount, form.durationMonths, form.interestRate, form.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/investments', {
        type: form.type,
        monthlyAmount: form.monthlyAmount ? Number(form.monthlyAmount) : undefined,
        principal: form.principal ? Number(form.principal) : undefined,
        durationMonths: form.durationMonths ? Number(form.durationMonths) : undefined,
        interestRate: form.interestRate ? Number(form.interestRate) : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        maturityDate: form.maturityDate ? new Date(form.maturityDate).toISOString() : undefined,
        maturityAmount: form.maturityAmount ? Number(form.maturityAmount) : undefined,
        institution: form.institution || undefined,
      });
      toast.success('Investment added!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to add investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Investment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            id="inv-type"
            label="Type"
            options={typeOptions}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value, maturityAmount: '' })}
          />
          <Input
            id="inv-institution"
            label="Institution"
            placeholder="e.g. SBI, HDFC"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(form.type === 'RD' || form.type === 'SIP') && (
            <Input
              id="inv-monthly"
              label="Monthly Amount (₹)"
              type="number"
              min="0"
              placeholder="0"
              value={form.monthlyAmount}
              onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value, maturityAmount: '' })}
            />
          )}
          <Input
            id="inv-principal"
            label="Principal (₹)"
            type="number"
            min="0"
            placeholder="0"
            value={form.principal}
            onChange={(e) => setForm({ ...form, principal: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="inv-duration"
            label="Duration (months)"
            type="number"
            min="1"
            placeholder="12"
            value={form.durationMonths}
            onChange={(e) => setForm({ ...form, durationMonths: e.target.value, maturityAmount: '' })}
          />
          <Input
            id="inv-interest"
            label="Interest Rate (% p.a.)"
            type="number"
            min="0"
            step="0.01"
            placeholder="7.5"
            value={form.interestRate}
            onChange={(e) => setForm({ ...form, interestRate: e.target.value, maturityAmount: '' })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="inv-start"
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            id="inv-maturity-date"
            label="Maturity Date"
            type="date"
            value={form.maturityDate}
            onChange={(e) => setForm({ ...form, maturityDate: e.target.value })}
          />
        </div>

        <Input
          id="inv-maturity-amount"
          label={form.type === 'RD' ? 'Maturity Amount (₹) — auto-calculated for RD' : 'Maturity Amount (₹)'}
          type="number"
          min="0"
          placeholder="0"
          value={form.maturityAmount}
          onChange={(e) => setForm({ ...form, maturityAmount: e.target.value })}
          hint={form.type === 'RD' ? 'Automatically calculated using RD formula. You can override.' : undefined}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading} type="button">Cancel</Button>
          <Button type="submit" fullWidth loading={loading} id="inv-submit-btn">Add Investment</Button>
        </div>
      </form>
    </Modal>
  );
}
