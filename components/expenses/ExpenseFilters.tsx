'use client';

import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

interface ExpenseFiltersProps {
  filters: { category: string; source: string; month: string };
  onChange: (f: { category: string; source: string; month: string }) => void;
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...[
    'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
    'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Other',
  ].map((c) => ({ value: c, label: c })),
];

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SMS', label: 'SMS' },
  { value: 'OCR', label: 'OCR' },
];

export default function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-44">
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
