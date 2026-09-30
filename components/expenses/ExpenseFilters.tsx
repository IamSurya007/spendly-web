'use client';

import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useCategories } from '@/lib/categories';

interface ExpenseFiltersProps {
  /** `category` holds a category or subcategory id. */
  filters: { category: string; source: string; month: string };
  onChange: (f: { category: string; source: string; month: string }) => void;
}

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SMS', label: 'SMS' },
  { value: 'OCR', label: 'OCR' },
];

export default function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps) {
  const categories = useCategories();
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.parents().flatMap((p) => [
      { value: p.id, label: p.name },
      ...categories.childrenOf(p.id).map((s) => ({ value: s.id, label: `   ${s.name}` })),
    ]),
  ];

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-52">
        <Select
          id="expense-filter-category"
          label="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        />
      </div>
      <div className="w-36">
        <Select
          id="expense-filter-source"
          label="Source"
          options={sourceOptions}
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value })}
        />
      </div>
      <div className="w-40">
        <Input
          id="expense-filter-month"
          label="Month"
          type="month"
          value={filters.month}
          onChange={(e) => onChange({ ...filters, month: e.target.value })}
        />
      </div>
    </div>
  );
}
