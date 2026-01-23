import React from 'react';
import { CalendarDays, PieChart, Wallet, Target, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'calendar', label: '가계부', icon: CalendarDays },
  { id: 'budget', label: '예산', icon: Target },
  { id: 'analysis', label: '통계', icon: PieChart },
  { id: 'asset', label: '자산', icon: Wallet },
  { id: 'settings', label: '설정', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-lovely-100 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-[2rem]">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-lovely-100 text-lovely-500 -translate-y-2 shadow-lg shadow-lovely-100" : "text-gray-300 hover:text-gray-500"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold transition-all duration-300",
                isActive ? "text-lovely-500 opacity-100" : "text-gray-300 opacity-0 h-0 overflow-hidden"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
