import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Asset, Transaction } from '../types/ledger';
import { normalizeTransactionType } from '../lib/utils';

// 예전 백업/저장소에 소문자('income' | 'expense')로 남아 있는 타입을 대문자 정본으로 맞춘다
export const normalizeTransactions = (transactions: Transaction[]): Transaction[] =>
  transactions.map((t) => ({ ...t, type: normalizeTransactionType(t.type) }));

  interface State {
  assets: Asset[];
  transactions: Transaction[];
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (id: string) => void;
  reset: () => void;
  setAllData: (data: { assets: Asset[], transactions: Transaction[] }) => void;
  
  // Getters
  getTotalAssets: () => number;
  getImpulseRatio: (periodPrefix?: string) => number; // 해당 기간 지출 중 돌발 비용 비율 (기간 생략 시 전체)
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      assets: [
        { id: '1', name: '우리집', category: 'REAL_ESTATE', balance: 500000000, color: 'bg-indigo-400' },
        { id: '2', name: '삼성전자', category: 'FINANCE', balance: 5000000, color: 'bg-blue-400' },
        { id: '3', name: '월급통장', category: 'CASH', balance: 2500000, color: 'bg-lovely-400' },
      ],
      transactions: [
        { 
          id: '1', type: 'INCOME', amount: 3000000, category: '급여', description: '3월 월급', 
          date: new Date().toISOString(), isImpulse: false, allocationType: 'LIVING' 
        },
        { 
          id: '2', type: 'EXPENSE', amount: 12000, budgetAmount: 10000, category: '식비', description: '점심', 
          date: new Date().toISOString(), isImpulse: false, allocationType: 'LIVING' 
        },
        { 
          id: '3', type: 'EXPENSE', amount: 150000, budgetAmount: 0, category: '쇼핑', description: '예쁜 원피스 발견', 
          date: new Date().toISOString(), isImpulse: true, allocationType: 'EVENT' 
        },
      ],

      addTransaction: (transaction) => set((state) => ({
        transactions: [
          { ...transaction, id: Math.random().toString(36).substr(2, 9) },
          ...state.transactions
        ]
      })),

      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      })),

      updateTransaction: (id, updatedTransaction) => set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === id ? { ...t, ...updatedTransaction } : t
        )
      })),

      addAsset: (asset) => set((state) => ({
        assets: [...state.assets, { ...asset, id: Math.random().toString(36).substr(2, 9) }]
      })),

      deleteAsset: (id) => set((state) => ({
        assets: state.assets.filter((a) => a.id !== id)
      })),

      reset: () => set({
        transactions: [],
        assets: [
          { id: '1', name: '현금', category: 'CASH', balance: 0, color: 'bg-lovely-400' }
        ],
      }),

      setAllData: (data) => set({
        assets: data.assets,
        transactions: normalizeTransactions(data.transactions)
      }),

      getTotalAssets: () => {
        const { assets, transactions } = get();
        const today = new Date().toISOString().slice(0, 10);

        const assetsTotal = assets.reduce((acc, cur) => acc + cur.balance, 0);

        const transactionsTotal = transactions
          .filter(t => t.date <= today)
          .reduce((acc, t) => {
            if (t.type === 'INCOME') return acc + t.amount;
            if (t.type === 'EXPENSE') return acc - t.amount;
            return acc;
          }, 0);

        return assetsTotal + transactionsTotal;
      },

      getImpulseRatio: (periodPrefix) => {
        const { transactions } = get();
        const scoped = periodPrefix
          ? transactions.filter(t => t.date.startsWith(periodPrefix))
          : transactions;
        const expenses = scoped.filter(t => t.type === 'EXPENSE');
        if (expenses.length === 0) return 0;
        
        const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
        const impulseExpense = expenses.filter(t => t.isImpulse).reduce((acc, t) => acc + t.amount, 0);
        
        return totalExpense > 0 ? (impulseExpense / totalExpense) * 100 : 0;
      }
    }),
    {
      name: 'lovely-ledger-v2',
      version: 1,
      // 이전 저장소(version 0)의 소문자 타입을 한 번 정리한다
      migrate: (persisted, version) => {
        const state = persisted as { assets?: Asset[]; transactions?: Transaction[] };
        if (version < 1 && state?.transactions) {
          return {
            ...state,
            transactions: normalizeTransactions(state.transactions),
          } as State;
        }
        return state as unknown as State;
      },
    }
  )
);
