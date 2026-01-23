import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { ImpulseCharacter } from './ImpulseCharacter';

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#8884d8', '#FF8042'];

const NATURE_LABELS: Record<string, string> = {
  LIVING: '생활비 (계획)',
  EVENT: '경조사/이벤트',
  INVEST: '저축/투자',
  IMPULSE: '돌발 비용 (지름신)',
};

const NATURE_COLORS: Record<string, string> = {
  LIVING: '#5D9C79', // Sage Green
  EVENT: '#FB923C',  // Orange
  INVEST: '#60A5FA', // Blue
  IMPULSE: '#F87171', // Red
};

export const AnalysisView = () => {
  const { transactions } = useStore();
  const [viewMode, setViewMode] = useState<'MONTH' | 'YEAR'>('MONTH');
  
  const currentDate = new Date();
  // toISOString()은 UTC 기준이므로 로컬 날짜 문자열 사용
  const localYear = currentDate.getFullYear();
  const localMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  const currentKey = viewMode === 'MONTH' 
    ? `${localYear}-${localMonth}`
    : `${localYear}`;

  // 데이터 필터링 및 가공
  const stats = useMemo(() => {
    // 대소문자 구분 없이 EXPENSE 필터링
    const filtered = transactions.filter(t => 
      t.date.startsWith(currentKey) && 
      (t.type === 'EXPENSE' || t.type === 'expense')
    );
    const total = filtered.reduce((acc, t) => acc + t.amount, 0);
    
    // 1. 지출 성격별 (Nature) 분석 - 돌발 비용 분리
    const byNature = filtered.reduce((acc, t) => {
      let key = 'LIVING';
      if (t.isImpulse) {
        key = 'IMPULSE';
      } else if (t.allocationType === 'INVEST_STABLE' || t.allocationType === 'INVEST_RISK') {
        key = 'INVEST';
      } else if (t.allocationType === 'EVENT') {
        key = 'EVENT';
      }
      
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const natureData = Object.entries(byNature).map(([key, value]) => ({
      name: NATURE_LABELS[key] || key,
      key: key,
      value,
      percent: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    // 2. 카테고리별 (Category) 분석
    const byCategory = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    return { total, natureData, categoryData };
  }, [transactions, currentKey]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-lovely-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold text-gray-800">
            {viewMode === 'MONTH' ? `${currentDate.getMonth() + 1}월` : `${currentDate.getFullYear()}년`} 분석
          </h2>
          <div className="bg-gray-100 p-1 rounded-xl flex text-xs font-bold">
            <button 
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'MONTH' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              월간
            </button>
            <button 
              onClick={() => setViewMode('YEAR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'YEAR' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              연간
            </button>
          </div>
        </div>
        <div className="text-center py-2">
          <p className="text-gray-400 text-sm mb-1">총 지출</p>
          <p className="text-3xl font-bold text-gray-800 tracking-tight">{formatCurrency(stats.total)}원</p>
        </div>
      </div>

      {/* Impulse Character Widget */}
      <ImpulseCharacter />

      {/* 1. 지출 성격 분석 (Nature) - Pie Chart */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-lovely-50">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1 h-4 bg-lovely-500 rounded-full"/>
          지출 성격 분석
        </h3>
        {stats.total > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.natureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.natureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={NATURE_COLORS[entry.key] || '#CBD5E1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${formatCurrency(value)}원`, '금액']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-gray-400">지출 구성</span>
              </div>
            </div>

            {/* Legend with colored numbers */}
            <div className="w-full space-y-3 mt-6">
              {stats.natureData.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: NATURE_COLORS[item.key] || '#CBD5E1' }} 
                    />
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{formatCurrency(item.value)}원</span>
                    <span 
                      className="text-xs font-bold"
                      style={{ color: NATURE_COLORS[item.key] || '#CBD5E1' }}
                    >
                      ({item.percent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8 text-sm">
            아직 지출 내역이 없어요.
          </div>
        )}
      </div>

      {/* 2. 카테고리별 상세 분석 */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-lovely-50">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-lavender-500 rounded-full"/>
          카테고리 랭킹
        </h3>
        
        {stats.total > 0 ? (
          <div className="h-[250px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData.slice(0, 5)} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  width={60}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${formatCurrency(value)}원`, '지출']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8 text-sm">
            데이터가 쌓이면 랭킹을 보여드릴게요!
          </div>
        )}
      </div>
    </div>
  );
};
