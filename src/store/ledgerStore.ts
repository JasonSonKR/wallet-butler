import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  category: string;
}

interface LedgerState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  getBalance: () => number;
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      transactions: [
        { id: '1', amount: 2500000, description: '월급', type: 'income', date: new Date().toISOString(), category: '급여' },
        { id: '2', amount: 12000, description: '맛있는 점심', type: 'expense', date: new Date().toISOString(), category: '식비' },
        { id: '3', amount: 4500, description: '커피', type: 'expense', date: new Date().toISOString(), category: '카페' },
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
      getBalance: () => {
        const { transactions } = get();
        return transactions.reduce((acc, curr) => {
          return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
        }, 0);
      },
    }),
    {
      name: 'lovely-ledger-storage',
    }
  )
);
