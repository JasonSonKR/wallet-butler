import React, { useState } from 'react';
import { useStore } from './store/useStore';
import { BottomNav } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { AssetView } from './components/AssetView';
import { AnalysisView } from './components/AnalysisView';
import { BudgetView } from './components/BudgetView';
import { SettingsView } from './components/SettingsView';
import { TransactionList } from './components/TransactionList';
import { TransactionForm, TransactionFormInitialValues } from './components/TransactionForm';
import { Wallet, CalendarClock, TrendingDown, TrendingUp } from 'lucide-react';
import { Transaction } from './types/ledger';
import { HOLIDAYS } from './lib/holidays';

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Modals State
  const [isAdding, setIsAdding] = useState(false);
  
  // Form Initial Values
  const [formInitialValues, setFormInitialValues] = useState<TransactionFormInitialValues>({});

  const { transactions, removeTransaction, updateTransaction } = useStore();

  const filteredTransactions = selectedDate ? transactions.filter(t => t.date.startsWith(selectedDate)) : [];

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleMenuSelect = (action: 'budget' | 'expense' | 'income') => {
    const newInitialValues: TransactionFormInitialValues = {
      amount: 0,
      description: '',
      isImpulse: false,
      convertingId: null,
    };

    if (action === 'budget') {
      newInitialValues.type = 'expense';
      newInitialValues.isPlanned = true;
      newInitialValues.category = '식비';
      newInitialValues.allocation = 'LIVING';
    } else if (action === 'expense') {
      newInitialValues.type = 'expense';
      newInitialValues.isPlanned = false;
      newInitialValues.category = '식비';
      newInitialValues.allocation = 'LIVING';
    } else {
      newInitialValues.type = 'income';
      newInitialValues.isPlanned = false;
      newInitialValues.category = '고정 수입';
      newInitialValues.allocation = 'LIVING';
    }

    setFormInitialValues(newInitialValues);
    setIsAdding(true);
  };

  const handleBudgetClick = (t: Transaction) => {
    if (!t.budgetAmount || t.budgetAmount <= 0) return;

    setFormInitialValues({
      convertingId: t.id,
      amount: t.budgetAmount,
      description: t.description,
      category: t.category,
      type: 'expense',
      isPlanned: false,
      isImpulse: false,
      allocation: 'LIVING',
      budgetAmount: t.budgetAmount,
    });
    setIsAdding(true);
  };

  const handleEdit = (t: Transaction) => {
    setFormInitialValues({
      id: t.id,
      amount: t.amount || t.budgetAmount || 0,
      description: t.description,
      type: t.type.toLowerCase() as 'income' | 'expense',
      category: t.category,
      isPlanned: (t.budgetAmount ?? 0) > 0 && t.amount === 0,
      allocation: t.allocationType,
      isImpulse: t.isImpulse,
      budgetAmount: t.budgetAmount,
    });
    setIsAdding(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            <CalendarView 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              selectedDate={selectedDate || ''}
              onSelectDate={handleDateClick}
            />
            
            {/* 인라인 액션 메뉴 (달력과 리스트 사이) */}
            {selectedDate && (
            <div className="grid grid-cols-3 gap-3 px-4">
              <button 
                onClick={() => handleMenuSelect('budget')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-[#CDE6DC] shadow-sm hover:bg-[#EFF7F3] transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#EFF7F3] flex items-center justify-center text-[#5D9C79]">
                  <CalendarClock size={20} />
                </div>
                <span className="text-[11px] font-bold text-[#5D9C79]">예산 계획</span>
              </button>

              <button 
                onClick={() => handleMenuSelect('expense')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-lovely-100 shadow-sm hover:bg-lovely-50 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-lovely-100 flex items-center justify-center text-lovely-500">
                  <TrendingDown size={20} />
                </div>
                <span className="text-[11px] font-bold text-lovely-500">지출 등록</span>
              </button>

              <button 
                onClick={() => handleMenuSelect('income')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-[#E8E1F5] shadow-sm hover:bg-[#F6F4FA] transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#F6F4FA] flex items-center justify-center text-[#8E7CC3]">
                  <TrendingUp size={20} />
                </div>
                <span className="text-[11px] font-bold text-[#8E7CC3]">수입 등록</span>
              </button>
            </div>
            )}

            <div className="px-2">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  {selectedDate ? `${parseInt(selectedDate.split('-')[2])}일의 내역` : '날짜를 선택해주세요'}
                  {selectedDate && HOLIDAYS[selectedDate] && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">{HOLIDAYS[selectedDate]}</span>
                  )}
                </h3>
                <span className="text-xs text-gray-400">{filteredTransactions.length}건</span>
              </div>

              <TransactionList 
                transactions={filteredTransactions}
                onBudgetClick={handleBudgetClick}
                onRemove={removeTransaction}
                onEdit={handleEdit}
              />
            </div>
          </div>
        );
      case 'asset': return <AssetView />;
      case 'analysis': return <AnalysisView />;
      case 'budget':
        return (
          <BudgetView 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        );
      case 'settings':
        return (
          <SettingsView />
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-lovely-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white/50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md p-6 pt-8 sticky top-0 z-30 border-b border-lovely-100">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
              <span className="text-lovely-500">🌸</span> Lovely Ledger
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lovely-100 rounded-full flex items-center justify-center text-lovely-500 font-bold text-xs">
                MY
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          {renderContent()}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <TransactionForm 
          isOpen={isAdding}
          onClose={() => setIsAdding(false)}
          selectedDate={selectedDate || ''}
          initialValues={formInitialValues}
        />
      </div>
    </div>
  );
}

export default App;
