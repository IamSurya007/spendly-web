'use client';

import { formatINR } from '@/lib/formatters';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import CategoryIcon from '@/components/categories/CategoryIcon';
import { useCategories } from '@/lib/categories';

interface BudgetStatus {
  category: string;
  categoryId?: string;
  month?: string;
  limit: number;
  spent: number;
  remaining: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED';
}

export default function BudgetCard({ budget }: { budget: BudgetStatus }) {
  const pct = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  const statusVariant =
    budget.status === 'OK' ? 'ok' : budget.status === 'WARNING' ? 'warning' : 'exceeded';
  const categories = useCategories();
  const category = categories.byId(budget.categoryId);

  return (
    <div className="card p-4 group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {category && <CategoryIcon category={category} size={34} />}
          <div>
            <p className="text-sm font-semibold text-[#0D1B3E]">{category?.name ?? budget.category}</p>
            <p className="text-xs text-[#7B8399] mt-0.5">
              Limit: {formatINR(budget.limit)}
              {budget.month === 'all' && <span className="ml-1">· every month (set in app)</span>}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant} dot>
          {budget.status}
        </Badge>
      </div>

      <ProgressBar
        value={pct}
        status={
          budget.status === 'OK' ? 'ok' : budget.status === 'WARNING' ? 'warning' : 'exceeded'
        }
        className="mb-3"
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#F0F2F6] rounded-lg p-2.5">
          <p className="text-xs text-[#7B8399]">Spent</p>
          <p className="text-sm font-bold text-[#C0293E]">{formatINR(budget.spent)}</p>
        </div>
        <div className="bg-[#F0F2F6] rounded-lg p-2.5">
          <p className="text-xs text-[#7B8399]">Remaining</p>
          <p
            className="text-sm font-bold"
            style={{ color: budget.remaining >= 0 ? '#1A7A4A' : '#C0293E' }}
          >
            {budget.remaining < 0 ? '-' : ''}{formatINR(Math.abs(budget.remaining))}
          </p>
        </div>
      </div>
    </div>
  );
}
