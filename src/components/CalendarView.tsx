import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { HOLIDAYS } from '../lib/holidays';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentDate, 
  onDateChange,
  selectedDate,
  onSelectDate
}) => {
  const { transactions } = useStore();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const handlePrevMonth = () => onDateChange(new Date(year, month - 1, 1));
  const handleNextMonth = () => onDateChange(new Date(year, month + 1, 1));

  const days = Array(startDayOfWeek).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getDayData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrans = transactions.filter(t => t.date.startsWith(dateStr));
    
    const hasIncome = dayTrans.some(t => t.type === 'INCOME');
    const hasExpense = dayTrans.some(t => t.type === 'EXPENSE' && t.amount > 0);
    const hasBudget = dayTrans.some(t => t.type === 'EXPENSE' && t.amount === 0 && (t.budgetAmount ?? 0) > 0);
    const holidayName = HOLIDAYS[dateStr];

    return { hasIncome, hasExpense, hasBudget, holidayName, dateStr };
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-lovely-100">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-lovely-50 rounded-full text-lovely-300 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-extrabold text-gray-800">
          {month + 1}월
        </h2>
        <button onClick={handleNextMonth} className="p-2 hover:bg-lovely-50 rounded-full text-lovely-300 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <div key={day} className={cn("text-xs font-bold", i === 0 ? "text-lovely-400" : "text-gray-400")}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          
          const { hasIncome, hasExpense, hasBudget, holidayName, dateStr } = getDayData(day);
          const isSelected = selectedDate === dateStr;
          const isSunday = i % 7 === 0;
          const isHoliday = !!holidayName;
          
          // UTC 시간대 오류를 막기 위해 로컬 시간 기준으로 오늘 날짜 계산
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const isToday = todayStr === dateStr;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 transition-all relative",
                isSelected ? "bg-lovely-200 text-lovely-700 shadow-lg shadow-lovely-100 scale-105 z-10" : "hover:bg-lovely-50 text-gray-600",
                isToday && !isSelected && "ring-2 ring-lovely-200 font-bold"
              )}
            >
              <span className={cn("text-xs mb-1", (isSunday || isHoliday) && !isSelected && "text-lovely-500")}>{day}</span>
              {isHoliday && !isSelected && (
                <div className="text-[8px] font-bold truncate w-full text-center text-lovely-400 px-1">{holidayName}</div>
              )}
              <div className="absolute bottom-2 flex items-center justify-center gap-1">
                {hasBudget && <div className="w-1.5 h-1.5 bg-[#5D9C79] rounded-full" />}
                {hasExpense && <div className="w-1.5 h-1.5 bg-lovely-500 rounded-full" />}
                {hasIncome && <div className="w-1.5 h-1.5 bg-[#8E7CC3] rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
