import React from 'react';
import { X, CalendarClock, TrendingDown, TrendingUp } from 'lucide-react';

interface DateActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelect: (action: 'budget' | 'expense' | 'income') => void;
}

export function DateActionMenu({ isOpen, onClose, selectedDate, onSelect }: DateActionMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl mb-4">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-lg font-bold text-gray-800">
            {parseInt(selectedDate.split('-')[1])}월 {parseInt(selectedDate.split('-')[2])}일 기록하기
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => onSelect('budget')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <CalendarClock size={24} />
            </div>
            <span className="text-xs font-bold text-gray-600">예산(계획)</span>
          </button>

          <button 
            onClick={() => onSelect('expense')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-lovely-50 hover:bg-lovely-100 transition-colors border border-lovely-100"
          >
            <div className="w-12 h-12 rounded-full bg-lovely-100 flex items-center justify-center text-lovely-500">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-lovely-600">지출 등록</span>
          </button>

          <button 
            onClick={() => onSelect('income')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-lavender-50 hover:bg-lavender-100 transition-colors border border-lavender-100"
          >
            <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-500">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-lavender-600">수입 등록</span>
          </button>
        </div>
      </div>
    </div>
  );
}
