'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatINR } from '@/lib/formatters';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Receipt, Landmark, TrendingUp, TrendingDown } from 'lucide-react';

interface ExpenseSummary {
  totalExpenses: number;
  totalIncome?: number;
}

interface LoanSummary {
  totalOwed: number;
  totalReceivable: number;
}

interface InvestmentSummary {
  totalPrincipal: number;
  totalMaturityValue: number;
}

interface CardData {
  title: string;
  value: string;
  subtitle?: string;
  subtitleValue?: string;
  icon: React.ReactNode;
  accent: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function SummaryCards() {
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null);
  const [loanSummary, setLoanSummary] = useState<LoanSummary | null>(null);
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.allSettled([
        api.get('/expenses/summary').then((r) => setExpenseSummary(r.data)),
        api.get('/loans/summary').then((r) => setLoanSummary(r.data)),
        api.get('/investments/summary').then((r) => setInvestmentSummary(r.data)),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    );
  }

  const netLoan = (loanSummary?.totalReceivable ?? 0) - (loanSummary?.totalOwed ?? 0);

  const cards: CardData[] = [
    {
      title: "This Month's Expenses",
      value: formatINR(expenseSummary?.totalExpenses ?? 0),
      subtitle: 'Income',
      subtitleValue: formatINR(expenseSummary?.totalIncome ?? 0),
      icon: <Receipt size={20} className="text-[#C0293E]" />,
      accent: '#C0293E',
      trend: 'down',
    },
    {
      title: 'Loan Position',
      value: formatINR(Math.abs(netLoan)),
      subtitle: netLoan >= 0 ? '↑ Net Receivable' : '↓ Net Owed',
      subtitleValue: `Owed: ${formatINR(loanSummary?.totalOwed ?? 0)}`,
      icon: <Landmark size={20} className="text-[#3D7FE8]" />,
      accent: '#3D7FE8',
      trend: netLoan >= 0 ? 'up' : 'down',
    },
    {
      title: 'Investment Portfolio',
      value: formatINR(investmentSummary?.totalPrincipal ?? 0),
      subtitle: 'Expected Maturity',
      subtitleValue: formatINR(investmentSummary?.totalMaturityValue ?? 0),
      icon: <TrendingUp size={20} className="text-[#1A7A4A]" />,
      accent: '#1A7A4A',
      trend: 'up',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="card p-5 group">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${card.accent}15` }}
            >
              {card.icon}
            </div>
            {card.trend === 'up' ? (
              <TrendingUp size={14} className="text-[#1A7A4A] mt-1" />
            ) : card.trend === 'down' ? (
              <TrendingDown size={14} className="text-[#C0293E] mt-1" />
            ) : null}
          </div>
          <p className="text-xs text-[#7B8399] mb-1">{card.title}</p>
          <p className="text-2xl font-bold text-[#0D1B3E] mb-2">{card.value}</p>
          {card.subtitle && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7B8399]">{card.subtitle}</span>
              <span className="text-xs font-medium text-[#0D1B3E]">{card.subtitleValue}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
