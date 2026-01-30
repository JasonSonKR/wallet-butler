import React, { useState, useEffect } from 'react';
import { X, CalendarClock, CheckCircle2, Ghost, CalendarDays, Gift } from 'lucide-react';
import { clsx } from 'clsx';
import { numberToKorean, INCOME_CATEGORIES, FREQUENCY_LABELS } from '../lib/utils';
import { AllocationType, RecurrenceFrequency } from '../types/ledger';
import { useStore } from '../store/useStore';
import { generateRecurringTransactions } from '../lib/recurrence';

const BUDGET_CATEGORIES = [
  { name: '식비', emoji: '🍚' },
  { name: '카페/간식', emoji: '☕' },
  { name: '쇼핑', emoji: '🛍️' },
  { name: '교통', emoji: '🚌' },
  { name: '통신', emoji: '📱' },
  { name: '의료/건강', emoji: '💊' },
  { name: '문화/여가', emoji: '🎬' },
  { name: '교육', emoji: '📚' },
  { name: '공과금', emoji: '⚡' },
  { name: '경조사', emoji: '💌' },
  { name: '기타', emoji: '🎸' },
];

export interface TransactionFormInitialValues {
  id?: string;
  amount?: number;
  description?: string;
  type?: 'income' | 'expense';
  category?: string;
  isPlanned?: boolean;
  allocation?: AllocationType;
  isImpulse?: boolean;
  convertingId?: string | null;
  budgetAmount?: number;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  initialValues: TransactionFormInitialValues;
}

export function TransactionForm({ isOpen, onClose, selectedDate, initialValues }: TransactionFormProps) {
  const { addTransaction, removeTransaction, updateTransaction } = useStore();

  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('식비');
  const [isPlanned, setIsPlanned] = useState(false);
  const [allocation, setAllocation] = useState<AllocationType>('LIVING');
  const [isImpulse, setIsImpulse] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [preservedBudgetAmount, setPreservedBudgetAmount] = useState(0);

  // Recurrence State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('WEEKLY');
  const [recurrenceEnd, setRecurrenceEnd] = useState('2099-12-31');
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEditingId(initialValues.id);
      setAmount(initialValues.amount ? initialValues.amount.toLocaleString() : '');
      setDesc(initialValues.description || '');
      setType(((initialValues.type || 'expense') as string).toLowerCase() as 'income' | 'expense');
      setCategory(initialValues.category || '식비');
      setIsPlanned(initialValues.isPlanned || false);
      setAllocation(initialValues.allocation || 'LIVING');
      setIsImpulse(initialValues.isImpulse || false);
      setConvertingId(initialValues.convertingId || null);
      setPreservedBudgetAmount(initialValues.budgetAmount || 0);
      
      // Reset recurrence
      setIsRecurring(false);
      setRecurrenceFreq('WEEKLY');
      setRecurrenceEnd('2099-12-31');
      setSelectedWeeks([]);
    }
  }, [isOpen, initialValues]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setAmount('');
      return;
    }
    const numberValue = parseInt(value, 10);
    setAmount(numberValue.toLocaleString());
  };

  const toggleWeekSelection = (week: number) => {
    if (selectedWeeks.includes(week)) {
      setSelectedWeeks(selectedWeeks.filter(w => w !== week));
    } else {
      setSelectedWeeks([...selectedWeeks, week].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = amount ? parseInt(amount.replace(/,/g, ''), 10) : 0;

    if (convertingId) {
      removeTransaction(convertingId);
    }

    // 카테고리가 '경조사'이면 자동으로 EVENT 타입으로 설정 (사용자가 명시적으로 변경하지 않은 경우)
    let finalAllocation = allocation;
    if (category === '경조사' && !isPlanned) {
      finalAllocation = 'EVENT';
    }

    const baseTransaction = {
      amount: isPlanned ? 0 : numericAmount, // [수정] 계획일 경우 실제 지출액은 0으로 저장
      description: desc,
      type: type.toUpperCase() as any,
      category: category,
      date: selectedDate,
      allocationType: finalAllocation,
      isImpulse: isImpulse,
      budgetAmount: isPlanned ? numericAmount : preservedBudgetAmount,
    };

    if (isPlanned && isRecurring) {
      const newTransactions = generateRecurringTransactions(baseTransaction, {
        frequency: recurrenceFreq,
        startDate: selectedDate,
        endDate: recurrenceEnd,
        weekNumbers: recurrenceFreq === 'MONTHLY' ? selectedWeeks : undefined,
      });
      newTransactions.forEach(t => addTransaction(t));
      alert(`${newTransactions.length}개의 반복 예산이 생성되었습니다.`);
    } else if (editingId) {
      updateTransaction(editingId, baseTransaction);
    } else {
      addTransaction(baseTransaction);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {convertingId 
              ? '예산을 지출로 확정' 
              : editingId 
                ? (isPlanned ? '예산 계획 수정' : '내역 수정')
                : (isPlanned ? '예산(계획) 추가' : (type === 'income' ? '수입 등록' : '지출 등록'))
            }
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">

          {convertingId && (
            <div className="bg-lovely-50 p-4 rounded-2xl flex items-center gap-3 text-lovely-600 text-xs border border-lovely-100">
              <CheckCircle2 size={16} />
              <p>계획했던 예산을 실제 지출로 변경합니다.</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-2 ml-1">금액</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className={clsx(
                "w-full text-3xl font-bold border-b-2 border-gray-100 outline-none py-2 bg-transparent transition-colors placeholder:text-gray-200",
                isPlanned 
                  ? "focus:border-[#5D9C79]" 
                  : (type === 'income' ? "focus:border-[#8E7CC3]" : "focus:border-lovely-500")
              )}
              autoFocus
            />
            {amount && (
              <p className={clsx(
                "text-sm font-medium mt-2 text-right",
                isPlanned ? "text-[#5D9C79]" : (type === 'income' ? "text-[#8E7CC3]" : "text-lovely-500")
              )}>
                {numberToKorean(parseInt(amount.replace(/,/g, ''), 10))}
              </p>
            )}
          </div>

          {!convertingId && (
            <div>
              <label className="block text-xs text-gray-400 mb-2 ml-1">내용</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="내용을 입력하세요 (선택)"
                className="w-full text-lg border-b-2 border-gray-100 focus:border-lovely-500 outline-none py-2 bg-transparent transition-colors"
              />
            </div>
          )}


          {type === 'expense' && !isPlanned && !convertingId && (
            <div 
              onClick={() => setIsImpulse(!isImpulse)}
              className={clsx(
                "p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border animate-in fade-in slide-in-from-top-2 duration-300",
                isImpulse 
                  ? "bg-red-50 border-red-100" 
                  : "bg-gray-50 border-transparent hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isImpulse ? "bg-red-100 text-red-500" : "bg-gray-200 text-gray-400"
                )}>
                  <Ghost size={20} />
                </div>
                <div>
                  <p className={clsx("font-bold text-sm", isImpulse ? "text-red-500" : "text-gray-600")}>
                    돌발 비용인가요?
                  </p>
                  <p className="text-[10px] text-gray-400">예상 못한 비용 발생</p>
                </div>
              </div>
              <div className={clsx(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                isImpulse ? "bg-red-500 border-red-500" : "border-gray-300"
              )}>
                {isImpulse && <CheckCircle2 size={14} className="text-white" />}
              </div>
            </div>
          )}

          {!convertingId && (
            <div>
              <label className="block text-xs text-gray-400 mb-2 ml-1">카테고리</label>
              <div className="grid grid-cols-4 gap-2">
                {type === 'expense' 
                  ? BUDGET_CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={clsx(
                          "px-2 py-3 rounded-xl text-[11px] font-bold transition-colors border break-keep flex flex-col items-center gap-1",
                          category === cat.name 
                            ? (isPlanned ? "bg-[#5D9C79] text-white border-[#5D9C79]" : "bg-lovely-500 text-white border-lovely-500")
                            : "bg-white text-gray-500 border-gray-200 hover:border-lovely-200"
                        )}
                      >
                        <span className="text-base">{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))
                  : INCOME_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={clsx(
                          "px-2 py-3 rounded-xl text-[11px] font-bold transition-colors border break-keep",
                          category === cat 
                            ? (type === 'income' ? "bg-[#8E7CC3] text-white border-[#8E7CC3]" : "bg-lovely-500 text-white border-lovely-500")
                            : "bg-white text-gray-500 border-gray-200 hover:border-lovely-200"
                        )}
                      >
                        {cat}
                      </button>
                    ))
                }
              </div>
            </div>
          )}

          {isPlanned && (
            <div className="bg-[#EFF7F3] p-4 rounded-2xl space-y-3 border border-[#CDE6DC]">
              <div className="flex items-center gap-3 text-[#4B8565] text-xs">
                <CalendarClock size={16} />
                <p>이 내역은 실제 지출이 아닌 '계획'으로 저장됩니다.</p>
              </div>

              {/* 예산 성격 선택 (생활비 vs 이벤트) */}
              <div className="flex bg-white rounded-xl p-1 border border-[#CDE6DC]">
                <button
                  type="button"
                  onClick={() => setAllocation('LIVING')}
                  className={clsx(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                    allocation === 'LIVING' ? "bg-[#5D9C79] text-white shadow-sm" : "text-gray-400 hover:bg-gray-50"
                  )}
                >
                  생활 예산 (매월)
                </button>
                <button
                  type="button"
                  onClick={() => setAllocation('EVENT')}
                  className={clsx(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1",
                    allocation === 'EVENT' ? "bg-orange-400 text-white shadow-sm" : "text-gray-400 hover:bg-gray-50"
                  )}
                >
                  <Gift size={12} />
                  이벤트/경조사
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-700">반복 설정</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isRecurring) setRecurrenceEnd(selectedDate);
                    setIsRecurring(!isRecurring);
                  }}
                  className={clsx(
                    "w-12 h-6 rounded-full transition-colors relative",
                    isRecurring ? "bg-[#5D9C79]" : "bg-gray-300"
                  )}
                >
                  <div className={clsx(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                    isRecurring ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {isRecurring && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 block mb-1">반복 주기</label>
                      <select 
                        value={recurrenceFreq}
                        onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFrequency)}
                        className="w-full p-2 rounded-xl border border-[#CDE6DC] text-sm bg-white focus:border-[#5D9C79] outline-none"
                      >
                        {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {recurrenceFreq === 'MONTHLY' && (
                      <div className="col-span-2">
                        <label className="text-xs text-gray-400 block mb-1">주차 선택 (복수 선택 가능)</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(week => (
                            <button
                              key={week}
                              type="button"
                              onClick={() => toggleWeekSelection(week)}
                              className={clsx(
                                "w-8 h-8 rounded-full text-xs font-bold border transition-colors",
                                selectedWeeks.includes(week)
                                  ? "bg-[#5D9C79] text-white border-[#5D9C79]"
                                  : "bg-white text-[#4B8565] border-[#CDE6DC]"
                              )}
                            >
                              {week}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 block mb-1">종료일</label>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-gray-400" />
                        <input 
                          type="date" 
                          value={recurrenceEnd}
                          onChange={(e) => setRecurrenceEnd(e.target.value)}
                          className="flex-1 p-2 rounded-xl border border-[#CDE6DC] text-sm bg-white focus:border-[#5D9C79] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className={clsx(
              "w-full py-4 rounded-2xl text-white font-bold shadow-lg transition-all mt-4",
              isPlanned 
                ? "bg-[#5D9C79] shadow-[#5D9C79]/30 hover:bg-[#4B8565]"
                : (type === 'income' 
                    ? "bg-[#8E7CC3] shadow-[#8E7CC3]/30 hover:bg-[#7A6AB0]"
                    : "bg-lovely-500 shadow-lovely-500/30 hover:bg-lovely-600")
            )}
          >
            {convertingId ? '지출로 확정하기' : editingId ? '수정 완료' : (isPlanned ? '계획 추가하기' : '추가하기')}
          </button>
        </form>
      </div>
    </div>
  );
}
