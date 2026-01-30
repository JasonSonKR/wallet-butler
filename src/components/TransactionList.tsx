import { TrendingUp, TrendingDown, Ghost, Repeat, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { clsx } from 'clsx';
import { formatCurrency } from '../lib/utils';
import { Transaction } from '../types/ledger';

interface TransactionListProps {
  transactions: Transaction[];
  onBudgetClick: (t: Transaction) => void;
  onRemove: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

export function TransactionList({ transactions, onBudgetClick, onRemove, onEdit }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-white/50 rounded-3xl border border-dashed border-gray-200">
        <p>이 날은 내역이 없어요 🌸</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => {
        const isBudget = (t.budgetAmount ?? 0) > 0 && t.amount === 0;
        const isIncome = t.type === 'INCOME' || t.type === 'income';
        return (
          <div 
            key={t.id} 
            className={clsx(
              "group flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all relative overflow-hidden",
              isBudget
                ? "bg-[#EFF7F3] border-dashed border-[#CDE6DC]" 
                : "bg-white border-lovely-50 hover:shadow-md"
            )}
          >
            {/* 배경 클릭 시 동작 (예산: 확정 팝업, 일반: 수정 팝업) */}
            <div 
              className="absolute inset-0 z-0 cursor-pointer"
              onClick={() => isBudget ? onBudgetClick(t) : onEdit(t)}
            />

            {isBudget && (
              <div className="absolute right-0 top-0 bg-[#E0F0E9] text-[10px] px-2 py-1 rounded-bl-xl text-[#4B8565] font-bold z-10 pointer-events-none">
                터치해서 지출로 확정
              </div>
            )}

            <div className="flex items-center gap-4 z-10 pointer-events-none">
              <div className={clsx(
                "p-3 rounded-xl flex items-center justify-center relative",
                isBudget 
                  ? "bg-[#E0F0E9] text-[#5D9C79]"
                  : (isIncome ? "bg-[#F0EBF7] text-[#8E7CC3]" : "bg-lovely-100 text-lovely-500")
              )}>
                {isIncome ? <TrendingUp size={18} /> : (isBudget ? <CalendarClock size={18} /> : <TrendingDown size={18} />)}
                {t.isImpulse && (
                  <div className="absolute -top-1 -right-1 bg-red-400 text-white p-0.5 rounded-full">
                    <Ghost size={8} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={clsx("font-bold", isBudget ? "text-[#2D523E]" : "text-gray-800")}>
                    {t.category}
                  </p>
                  {t.allocationType === 'EVENT' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-md font-bold">이벤트</span>
                  )}
                  {t.recurrenceId && (
                    <Repeat size={12} className="text-gray-400" />
                  )}
                </div>
                {t.description && <p className={clsx("text-xs", isBudget ? "text-[#4B8565]/70" : "text-gray-400")}>{t.description}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-3 z-10">
              <div className="text-right pointer-events-none">
                <p className={clsx(
                  "font-bold",
                  isBudget ? "text-[#4B8565]" : (isIncome ? "text-[#8E7CC3]" : "text-lovely-500")
                )}>
                  {isIncome ? '+' : ''}{formatCurrency(t.amount || t.budgetAmount || 0)}
                </p>
              </div>
              
              {/* 수정/삭제 버튼 그룹 */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(t);
                  }}
                  className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="수정"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('정말 삭제하시겠습니까?')) {
                      onRemove(t.id);
                    }
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
