'use client';

import { useState } from 'react';
import type { CategoryKind } from '@/lib/categories.generated';
import type { CategoryRegistry } from '@/lib/categories';
import CategoryIcon from './CategoryIcon';

export interface CategoryValue {
  categoryId: string;
  subcategoryId: string | null;
}

/**
 * Grid of parent categories; the selected parent's subcategories appear as
 * chips underneath. Fold-style.
 */
export default function CategoryPicker({
  registry,
  value,
  onChange,
  kind = 'expense',
  error,
}: {
  registry: CategoryRegistry;
  value: CategoryValue | null;
  onChange: (v: CategoryValue) => void;
  kind?: CategoryKind;
  error?: string;
}) {
  const [tab, setTab] = useState<CategoryKind>(kind);
  const parents = registry.parents(tab);
  const selectedParent = value ? registry.byId(value.categoryId) : undefined;
  const subs = selectedParent ? registry.childrenOf(selectedParent.id) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-[#0D1B3E]">Category</label>
        <div className="flex gap-1 text-[11px]">
          {(['expense', 'income', 'transfer'] as CategoryKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-2 py-0.5 rounded-md capitalize ${tab === k ? 'bg-[#0D1B3E] text-white' : 'text-[#7B8399] hover:bg-[#EEF1F8]'}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1">
        {parents.map((p) => {
          const selected = value?.categoryId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ categoryId: p.id, subcategoryId: null })}
              className={`flex flex-col items-center gap-1 rounded-xl p-1.5 text-[10px] leading-tight text-[#0D1B3E] border transition-colors ${
                selected ? 'border-current' : 'border-transparent hover:bg-[#F0F2F6]'
              }`}
              style={selected ? { color: p.color, backgroundColor: `${p.color}10` } : undefined}
            >
              <CategoryIcon category={p} size={34} />
              <span className="text-center text-[#0D1B3E] line-clamp-2">{p.name}</span>
            </button>
          );
        })}
      </div>

      {subs.length > 0 && selectedParent && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {subs.map((s) => {
            const selected = value?.subcategoryId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  onChange({ categoryId: selectedParent.id, subcategoryId: selected ? null : s.id })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs text-[#0D1B3E]"
                style={
                  selected
                    ? { borderColor: s.color, backgroundColor: `${s.color}1f` }
                    : { borderColor: '#E4E7EF', backgroundColor: '#F0F2F6' }
                }
              >
                <CategoryIcon category={s} size={16} />
                {s.name}
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-[#C0293E]">{error}</p>}
    </div>
  );
}
