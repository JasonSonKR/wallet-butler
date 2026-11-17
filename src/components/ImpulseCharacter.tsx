import { useStore } from '../store/useStore';
import { Ghost, Zap } from 'lucide-react';

interface ImpulseCharacterProps {
  /** yyyy-MM 또는 yyyy (선택된 기간) */
  periodKey: string;
  /** '11월', '2026년' */
  periodLabel: string;
  /** '이 달', '올해' */
  scopeLabel: string;
}

export const ImpulseCharacter = ({ periodKey, periodLabel, scopeLabel }: ImpulseCharacterProps) => {
  const { getImpulseRatio } = useStore();
  const ratio = getImpulseRatio(periodKey);

  // 돌발 비율에 따른 캐릭터 상태 결정
  const getCharacterState = () => {
    if (ratio === 0) return { 
      icon: <Ghost size={44} className="text-gray-300" />, 
      text: "아직은 평화로워요 zZ",
      color: "bg-gray-100",
      animate: ""
    };
    if (ratio < 20) return { 
      icon: <Ghost size={44} className="text-lovely-300" />, 
      text: "살짝 지름신이 왔어요!",
      color: "bg-lovely-50",
      animate: "animate-bounce"
    };
    if (ratio < 50) return { 
      icon: <Ghost size={48} className="text-lovely-500" />, 
      text: "지름신이 춤추고 있어요!",
      color: "bg-lovely-100",
      animate: "animate-pulse"
    };
    return { 
      icon: <Zap size={52} className="text-yellow-500 fill-yellow-500" />, 
      text: "지름 폭발! 통장이 위험해요!",
      color: "bg-red-50",
      animate: "animate-spin-slow"
    };
  };

  const state = getCharacterState();

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 ${state.color} transition-all duration-500 border border-white/50 shadow-sm`}>
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="min-w-0">
          <h3 className="text-gray-500 text-xs font-bold mb-1">{periodLabel} 돌발 지출 지수</h3>
          <p className="text-gray-800 font-bold text-lg leading-snug">{state.text}</p>
          <p className="text-lovely-500 text-sm font-medium mt-1">{scopeLabel} 지출의 {Math.round(ratio)}%</p>
        </div>
        <div className={`${state.animate} transition-all duration-500 shrink-0`}>
          {state.icon}
        </div>
      </div>
      
      {/* 배경 장식 */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-40 rounded-full blur-xl" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
    </div>
  );
};
