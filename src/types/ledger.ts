export type AssetCategory = 'REAL_ESTATE' | 'FINANCE' | 'CASH' | 'LOAN';
export type AllocationType = 'INVEST_STABLE' | 'INVEST_RISK' | 'LIVING' | 'EVENT';
export type TransactionType = 'INCOME' | 'EXPENSE';

export type RecurrenceFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate: string;
  weekNumbers?: number[]; // 매월 선택 시 (1, 2, 3, 4, 5주차)
}

export interface LoanDetails {
  interestRate: string; // 연 이자율 (%)
  duration: string; // 대출 기간 (개월)
  gracePeriod: string; // 거치 기간 (개월)
  method: 'EQUAL_PRINCIPAL' | 'EQUAL_PAYMENT' | 'BULK'; // 상환 방식
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  balance: number;
  color: string;
  loanDetails?: LoanDetails;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  budgetAmount?: number;
  category: string;
  description: string;
  date: string;
  isImpulse: boolean;
  allocationType: AllocationType;
  recurrenceId?: string; // 반복 일정으로 생성된 경우 그룹 ID
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  REAL_ESTATE: '부동산',
  FINANCE: '예적금/투자',
  CASH: '현금',
  LOAN: '대출/부채',
};

export const ALLOCATION_LABELS: Record<AllocationType, string> = {
  INVEST_STABLE: '안정 투자',
  INVEST_RISK: '공격 투자',
  LIVING: '생활비',
  EVENT: '경조사/비정기',
};

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: '매주',
  BIWEEKLY: '격주 (2주마다)',
  MONTHLY: '매월 (주차 선택)',
  QUARTERLY: '매분기 (3개월)',
  SEMIANNUAL: '매반기 (6개월)',
  ANNUAL: '매년',
};
