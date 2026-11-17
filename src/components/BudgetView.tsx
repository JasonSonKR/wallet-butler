import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn, formatCurrency } from '../lib/utils';

interface BudgetViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ 
  currentDate,
  onDateChange
}) => {
  const { transactions } = useStore();
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [isImpulseExpanded, setIsImpulseExpanded] = useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  // 해당 월의 지출(EXPENSE) 트랜잭션 필터링
  const monthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonthStr) && t.type === 'EXPENSE'
  );

  // 생활비(LIVING)와 이벤트(EVENT) 분리
  const livingTransactions = monthTransactions.filter(t => t.allocationType !== 'EVENT');
  const eventTransactions = monthTransactions.filter(t => t.allocationType === 'EVENT');

  // 1. 총 예산 (Total Budget): 해당 월의 모든 budgetAmount 합계 (생활비만)
  const totalBudget = livingTransactions.reduce((acc, t) => acc + (t.budgetAmount || 0), 0);

  // 2. 지출 (Spent): 실제 지출된 금액 (amount) (생활비만)
  const totalSpent = livingTransactions.reduce((acc, t) => acc + t.amount, 0);

  // 3. 예상 (Expected): 아직 지출되지 않은 계획된 예산 (amount가 0인 항목의 budgetAmount) (생활비만)
  const totalExpected = livingTransactions
    .filter(t => t.amount === 0 && (t.budgetAmount || 0) > 0)
    .reduce((acc, t) => acc + (t.budgetAmount || 0), 0);

  // 총 사용(예정 포함) 금액
  const totalUsed = totalSpent + totalExpected;
  
  // 퍼센트 계산
  const usagePercent = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;
  const isOverBudget = totalUsed > totalBudget;
  const remaining = totalBudget - totalUsed;

  // --- 이벤트 예산 계산 ---
  const eventBudget = eventTransactions.reduce((acc, t) => acc + (t.budgetAmount || 0), 0);
  const eventSpent = eventTransactions.reduce((acc, t) => acc + t.amount, 0);
  const eventRemaining = eventBudget - eventSpent;

  // 주차 계산 헬퍼 함수
  const getWeekOfMonth = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const dayOfWeek = firstDay.getDay();
    return Math.ceil((d + dayOfWeek) / 7);
  };

  // 해당 월의 총 주차 수 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const maxWeeks = Math.ceil((lastDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);

  // 주차별 데이터 그룹화
  const weeklyStats = Array.from({ length: maxWeeks }, (_, i) => {
    const weekNum = i + 1;
    const weekTrans = livingTransactions.filter(t => getWeekOfMonth(t.date) === weekNum); // 생활비만 주차별 분석
    
    const wBudget = weekTrans.reduce((acc, t) => acc + (t.budgetAmount || 0), 0);
    const wSpent = weekTrans.reduce((acc, t) => acc + t.amount, 0);
    const wExpected = weekTrans
      .filter(t => t.amount === 0 && (t.budgetAmount || 0) > 0)
      .reduce((acc, t) => acc + (t.budgetAmount || 0), 0);
    
    // 카테고리별 데이터
    const categories: Record<string, { budget: number, spent: number, expected: number }> = {};
    weekTrans.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = { budget: 0, spent: 0, expected: 0 };
      }
      categories[t.category].budget += (t.budgetAmount || 0);
      categories[t.category].spent += t.amount;
      if (t.amount === 0 && (t.budgetAmount || 0) > 0) {
        categories[t.category].expected += (t.budgetAmount || 0);
      }
    });

    return {
      weekNum,
      budget: wBudget,
      spent: wSpent,
      expected: wExpected,
      categories
    };
  });

  // 돌발 지출 분석
  const impulseTransactions = monthTransactions.filter(t => t.isImpulse);
  const totalImpulse = impulseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const impulseStats = Object.entries(
    impulseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => 
      prev.includes(weekNum) ? prev.filter(w => w !== weekNum) : [...prev, weekNum]
    );
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-lovely-100 relative overflow-hidden">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-lovely-50 rounded-full text-lovely-300 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-extrabold text-gray-800">
            {month + 1}월 예산
          </h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-lovely-50 rounded-full text-lovely-300 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="relative z-10 text-center space-y-2">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 font-medium text-sm">남은 생활비</span>
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", isOverBudget ? "bg-red-100 text-red-500" : "bg-lovely-50 text-lovely-500")}>
              {Math.round(usagePercent)}% 사용
            </span>
          </div>
          
          <h3 className={cn("text-4xl font-extrabold mb-6 tracking-tight text-left", remaining < 0 ? "text-red-500" : "text-gray-800")}>
            {formatCurrency(remaining)}원
          </h3>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 relative z-10">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {/* Spent Bar */}
            <div 
              className="h-full bg-lovely-400 transition-all duration-500"
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
            {/* Expected Bar */}
            <div 
              className="h-full bg-[#5D9C79] opacity-60 transition-all duration-500"
              style={{ width: `${Math.min((totalExpected / totalBudget) * 100, 100 - Math.min((totalSpent / totalBudget) * 100, 100))}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 mt-6 divide-x divide-gray-100">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">지출</span>
              <span className="text-lovely-500 font-bold">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">예상</span>
              <span className="text-[#5D9C79] font-bold">{formatCurrency(totalExpected)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">총 예산</span>
              <span className="text-gray-800 font-bold">{formatCurrency(totalBudget)}</span>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        {isOverBudget && (
          <div className="mt-6 bg-red-50 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-xs font-bold text-red-500">
              예산을 초과했어요! 지출을 분석해보세요 🚨
            </p>
          </div>
        )}
      </div>

      {/* Event Budget Card */}
      {(eventBudget > 0 || eventSpent > 0) && (
        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-400 shadow-sm">
              <Gift size={20} />
            </div>
            <div>
              <h4 className="font-bold text-orange-900 text-sm">이벤트 & 경조사</h4>
              <p className="text-xs text-orange-600/70">별도 예산으로 관리 중</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-600 mb-0.5">남은 금액</p>
            <p className={cn("font-bold text-lg", eventRemaining < 0 ? "text-red-500" : "text-orange-700")}>
              {formatCurrency(eventRemaining)}원
            </p>
            <p className="text-[10px] text-orange-400">
              예산 {formatCurrency(eventBudget)}원
            </p>
          </div>
        </div>
      )}

      {/* Weekly Analysis */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 px-2">주차별 분석</h3>
        {weeklyStats.map(stat => {
          const wTotalUsed = stat.spent + stat.expected;
          const wRemaining = stat.budget - wTotalUsed;
          const wPercent = stat.budget > 0 ? (wTotalUsed / stat.budget) * 100 : 0;
          const isExpanded = expandedWeeks.includes(stat.weekNum);

          return (
            <div key={stat.weekNum} className="bg-white rounded-2xl p-5 shadow-sm border border-lovely-50 transition-all">
              <div 
                className="cursor-pointer"
                onClick={() => toggleWeek(stat.weekNum)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{stat.weekNum}주차</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold", wRemaining < 0 ? "text-red-500" : "text-gray-500")}>
                      남은 예산 {formatCurrency(wRemaining)}원
                    </span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", wPercent > 100 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-600")}>
                      {Math.round(wPercent)}%
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-lovely-400"
                    style={{ width: `${Math.min((stat.spent / stat.budget) * 100, 100)}%` }}
                  />
                  <div 
                    className="h-full bg-[#5D9C79] opacity-60"
                    style={{ width: `${Math.min((stat.expected / stat.budget) * 100, 100 - Math.min((stat.spent / stat.budget) * 100, 100))}%` }}
                  />
                </div>
              </div>

              {/* Expanded Category Details */}
              {isExpanded && (
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-50 animate-in fade-in slide-in-from-top-1">
                  {Object.entries(stat.categories).map(([catName, data]) => {
                    const cTotalUsed = data.spent + data.expected;
                    const cRemaining = data.budget - cTotalUsed;
                    const cPercent = data.budget > 0 ? (cTotalUsed / data.budget) * 100 : 0;

                    return (
                      <div key={catName} className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 font-medium">{catName}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={cn(cRemaining < 0 ? "text-red-400" : "text-gray-400")}>
                              {formatCurrency(cRemaining)}원
                            </span>
                            <span className="font-bold text-gray-500">{Math.round(cPercent)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-lovely-300"
                            style={{ width: `${Math.min((data.spent / data.budget) * 100, 100)}%` }}
                          />
                          <div 
                            className="h-full bg-[#5D9C79] opacity-40"
                            style={{ width: `${Math.min((data.expected / data.budget) * 100, 100 - Math.min((data.spent / data.budget) * 100, 100))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stat.categories).length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-2">내역이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Impulse Analysis */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 px-2">지름신이 다녀간 흔적 💸</h3>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 transition-all">
          <div 
            className="cursor-pointer"
            onClick={() => setIsImpulseExpanded(!isImpulseExpanded)}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">총 돌발 비용</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-500">
                  {formatCurrency(totalImpulse)}원
                </span>
                {isImpulseExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>
          </div>

          {isImpulseExpanded && (
            <div className="mt-4 space-y-3 pt-3 border-t border-gray-50 animate-in fade-in slide-in-from-top-1">
              {impulseStats.map(([cat, amount]) => (
                <div key={cat} className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 font-medium">{cat}</span>
                    <span className="font-bold text-red-400">{formatCurrency(amount)}원</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-400"
                      style={{ width: `${totalImpulse > 0 ? (amount / totalImpulse) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {impulseStats.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-2">이번 달은 지름신을 잘 막아냈어요! 🛡️</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
