'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Loan } from '@/types';

interface LoanFormData {
  type: 'TAKEN' | 'GIVEN';
  name: string;
  principal: string;
  total: string;
  repaymentDate: string;
  notes: string;
}

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loan?: Loan | null;
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export default function LoanModal({ isOpen, onClose, onSuccess, loan }: LoanModalProps) {
  const isEdit = !!loan?.id;
  const [form, setForm] = useState<LoanFormData>({
    type: 'TAKEN',
    name: '',
    principal: '',
    total: '',
    repaymentDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setForm({
        type: loan.type || 'TAKEN',
        name: loan.name || '',
        principal: loan.principal !== undefined ? loan.principal.toString() : '',
        total: loan.total !== undefined ? loan.total.toString() : '',
        repaymentDate: formatDateForInput(loan.repaymentDate),
        notes: loan.notes || '',
      });
    } else {
      setForm({ type: 'TAKEN', name: '', principal: '', total: '', repaymentDate: '', notes: '' });
    }
  }, [loan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        type: form.type,
        name: form.name.trim(),
        principal: Number(form.principal),
        total: Number(form.total) || Number(form.principal),
        repaymentDate: form.repaymentDate ? new Date(form.repaymentDate).toISOString() : undefined,
        notes: form.notes.trim() || undefined,
      };

      if (isEdit) {
        await api.patch(`/loans/${loan!.id}`, payload);
        toast.success('Loan updated!');
      } else {
        await api.post('/loans', payload);
        toast.success('Loan added!');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(isEdit ? 'Failed to update loan' : 'Failed to add loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Loan' : 'Add Loan'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="loan-type"
          label="Type"
          options={[
            { value: 'TAKEN', label: 'Taken (I owe)' },
            { value: 'GIVEN', label: 'Given (They owe me)' },
          ]}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as 'TAKEN' | 'GIVEN' })}
          required
        />
        <Input
          id="loan-name"
          label="Person / Description"
          placeholder="e.g. Rahul Singh"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="loan-principal"
            label="Principal (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.principal}
            onChange={(e) => setForm({ ...form, principal: e.target.value })}
            required
          />
          <Input
            id="loan-total"
            label="Total with Interest (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="Same as principal if none"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
          />
        </div>
        <Input
          id="loan-repayment-date"
          label="Repayment Date"
          type="date"
          value={form.repaymentDate}
          onChange={(e) => setForm({ ...form, repaymentDate: e.target.value })}
        />
        <Input
          id="loan-notes"
          label="Notes (optional)"
          placeholder="Any additional info..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading} id="loan-submit-btn">
            {isEdit ? 'Update Loan' : 'Add Loan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
