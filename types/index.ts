export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'wallet';
  currentBalance: number;
  creditLimit?: number;
  accountNumberLast4?: string;
  colorValue?: number;
  clientId?: string;
  version?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  method: 'CASH' | 'UPI' | 'CARD' | 'NETBANKING' | string;
  source: 'MANUAL' | 'SMS' | 'OCR' | string;
  merchant?: string;
  accountId?: string;
  isCountedAsSpend?: boolean;
  is_counted_as_spend?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalIncome?: number;
  balance?: number;
}

export interface Loan {
  id: string;
  type: 'TAKEN' | 'GIVEN';
  name: string;
  principal: number;
  total: number;
  repaymentDate?: string;
  notes?: string;
  status: 'ACTIVE' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanSummary {
  totalOwed: number;
  totalReceivable: number;
}

export interface Investment {
  id: string;
  type: string;
  monthlyAmount?: number;
  principal?: number;
  durationMonths?: number;
  interestRate?: number;
  startDate?: string;
  maturityDate?: string;
  maturityAmount?: number;
  institution?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestmentSummary {
  totalPrincipal: number;
  totalMaturityValue: number;
}

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED';
}
