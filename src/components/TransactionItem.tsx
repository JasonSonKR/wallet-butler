import React from 'react';
import { Transaction } from '../types/ledger';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Coffee, ShoppingBag, Home, DollarSign, Utensils, Heart } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const getIcon = (category: string) => {
  switch (category) {
    case '식비': return <Utensils size={18} />;
    case '카페': return <Coffee size={18} />;
    case '쇼핑': return <ShoppingBag size={18} />;
    case '급여': return <DollarSign size={18} />;
    case '주거': return <Home size={18} />;
    default: return <Heart size={18} />;
  }
};

export const TransactionItem: React.FC<Props> = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-lovely-100 hover:shadow-md transition-all duration-300 mb-3">
      <div className="flex items-center gap-4">
        <div className={clsx(
          "p-3 rounded-xl flex items-center justify-center",
          isIncome ? "bg-lavender-100 text-lavender-500" : "bg-lovely-100 text-lovely-500"
        )}>
          {getIcon(transaction.category)}
        </div>
        <div>
          <p className="font-bold text-gray-800">{transaction.description}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(transaction.date), 'M월 d일 a h:mm', { locale: ko })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={clsx(
          "font-bold text-lg",
          isIncome ? "text-lavender-500" : "text-lovely-500"
        )}>
          {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()}원
        </p>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          삭제
        </button>
      </div>
    </div>
  );
};
