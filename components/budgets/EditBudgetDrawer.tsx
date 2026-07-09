'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';

interface CategoryLimit {
  category: string;
  limit: string;
}

interface EditBudgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  onSuccess: () => void;
  existingBudgets?: { category: string; limit: number }[];
}

const defaultCategories = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Other',
];

export default function EditBudgetDrawer({
  isOpen,
  onClose,
  month,
  onSuccess,
  existingBudgets = [],
}: EditBudgetDrawerProps) {
  const [categories, setCategories] = useState<CategoryLimit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingBudgets.length > 0) {
        setCategories(existingBudgets.map((b) => ({ category: b.category, limit: b.limit.toString() })));
      } else {
        setCategories(defaultCategories.map((c) => ({ category: c, limit: '' })));
      }
    }
  }, [isOpen, existingBudgets]);

  const handleSave = async () => {
    const validCategories = categories.filter((c) => c.category && c.limit && Number(c.limit) > 0);
    if (validCategories.length === 0) {
      toast.error('Please add at least one budget limit');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/budgets/${month}`, {
        budgets: validCategories.map((c) => ({
          category: c.category,
          limit: Number(c.limit),
        })),
      });
      toast.success('Budgets saved!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save budgets');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0D1B3E]/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full animate-slide-in-right flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EF]">
          <div>
            <h2 className="text-base font-semibold text-[#0D1B3E]">Set Budgets</h2>
            <p className="text-xs text-[#7B8399]">{month}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EEF1F8] text-[#7B8399] hover:text-[#0D1B3E] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  id={`budget-category-${i}`}
                  label={i === 0 ? 'Category' : undefined}
                  value={cat.category}
                  onChange={(e) => {
                    const updated = [...categories];
                    updated[i].category = e.target.value;
                    setCategories(updated);
                  }}
                  placeholder="Category name"
                />
              </div>
              <div className="w-28">
                <Input
                  id={`budget-limit-${i}`}
                  label={i === 0 ? 'Limit (₹)' : undefined}
                  type="number"
                  min="0"
                  value={cat.limit}
                  onChange={(e) => {
                    const updated = [...categories];
                    updated[i].limit = e.target.value;
                    setCategories(updated);
                  }}
                  placeholder="0"
                />
              </div>
              <button
                onClick={() => setCategories(categories.filter((_, j) => j !== i))}
                className="p-2 mb-0.5 rounded-lg hover:bg-[#C0293E]/10 text-[#7B8399] hover:text-[#C0293E] transition-colors"
                aria-label="Remove category"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setCategories([...categories, { category: '', limit: '' }])}
            className="flex items-center gap-2 text-sm text-[#3D7FE8] hover:text-[#2d6fd8] transition-colors py-2"
          >
            <Plus size={15} />
            Add category
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E4E7EF] flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button fullWidth loading={loading} onClick={handleSave} id="budget-save-btn">
            Save Budgets
          </Button>
        </div>
      </div>
    </div>
  );
}
