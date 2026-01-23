import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Asset, Transaction } from '../types/ledger';

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
  getImpulseRatio: () => number; // 전체 지출 중 돌발 비용 비율
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
        transactions: data.transactions
      }),

      getTotalAssets: () => {
        return get().assets.reduce((acc, cur) => acc + cur.balance, 0);
      },

      getImpulseRatio: () => {
        const { transactions } = get();
        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        if (expenses.length === 0) return 0;
        
        const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
        const impulseExpense = expenses.filter(t => t.isImpulse).reduce((acc, t) => acc + t.amount, 0);
        
        return (impulseExpense / totalExpense) * 100;
      }
    }),
    {
      name: 'lovely-ledger-v2',
    }
  )
);
