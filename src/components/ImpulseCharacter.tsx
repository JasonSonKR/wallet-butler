import React from 'react';
import { useStore } from '../store/useStore';
import { Ghost, Zap } from 'lucide-react';

export const ImpulseCharacter = () => {
  const { getImpulseRatio } = useStore();
  const ratio = getImpulseRatio();

  // 돌발 비율에 따른 캐릭터 상태 결정
  const getCharacterState = () => {
    if (ratio === 0) return { 
      icon: <Ghost size={48} className="text-gray-300" />, 
      text: "아직은 평화로워요 zZ",
      color: "bg-gray-100",
      animate: ""
    };
    if (ratio < 20) return { 
      icon: <Ghost size={48} className="text-lovely-300" />, 
      text: "살짝 지름신이 왔어요!",
      color: "bg-lovely-50",
      animate: "animate-bounce"
    };
    if (ratio < 50) return { 
      icon: <Ghost size={56} className="text-lovely-500" />, 
      text: "지름신이 춤추고 있어요!",
      color: "bg-lovely-100",
      animate: "animate-pulse"
    };
    return { 
      icon: <Zap size={64} className="text-yellow-500 fill-yellow-500" />, 
      text: "지름 폭발! 통장이 위험해요!",
      color: "bg-red-50",
      animate: "animate-spin-slow"
    };
  };

  const state = getCharacterState();

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 ${state.color} transition-all duration-500 border border-white/50 shadow-sm`}>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-gray-500 text-xs font-bold mb-1">이번 달 돌발 지출 지수</h3>
          <p className="text-gray-800 font-bold text-lg">{state.text}</p>
          <p className="text-lovely-500 text-sm font-medium mt-1">전체 지출의 {Math.round(ratio)}%</p>
        </div>
        <div className={`${state.animate} transition-all duration-500`}>
          {state.icon}
        </div>
      </div>
      
      {/* 배경 장식 */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-40 rounded-full blur-xl" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
    </div>
  );
};
