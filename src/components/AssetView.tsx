import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, cn, numberToKorean } from '../lib/utils';
import { Asset, AssetCategory, LoanDetails, ASSET_CATEGORY_LABELS } from '../types/ledger';
import { Building2, Landmark, Wallet, Plus, Check, CreditCard, Calculator, X, Pencil } from 'lucide-react';

const ASSET_COLORS = [
  'bg-lovely-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-pink-400',
];

export const AssetView = () => {
  const { assets, addAsset, deleteAsset } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 입력 폼 상태
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('CASH');
  const [amount, setAmount] = useState(''); // 콤마 포맷팅된 문자열
  const [color, setColor] = useState(ASSET_COLORS[0]);
  
  // 부채 관련 상태
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    interestRate: '',
    duration: '12',
    gracePeriod: '0',
    method: 'EQUAL_PAYMENT'
  });

  // 순자산 계산 (총 자산 - 부채)
  const netWorth = useMemo(() => {
    let assetTotal = 0;
    let loanTotal = 0;

    assets.forEach(asset => {
      const balance = Number(asset.balance) || 0;
      if (asset.category === 'LOAN') {
        loanTotal += balance;
      } else {
        assetTotal += balance;
      }
    });

    return assetTotal - loanTotal;
  }, [assets]);

  const getIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'REAL_ESTATE': return <Building2 size={20} className="text-white" />;
      case 'FINANCE': return <Landmark size={20} className="text-white" />;
      case 'CASH': return <Wallet size={20} className="text-white" />;
      case 'LOAN': return <CreditCard size={20} className="text-white" />;
      default: return <Wallet size={20} className="text-white" />;
    }
  };

  // 금액 입력 핸들러 (콤마 포맷팅)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setAmount('');
      return;
    }
    const numberValue = parseInt(value, 10);
    setAmount(numberValue.toLocaleString());
  };

  // 월 상환금 계산 (단순 참고용)
  const monthlyPayment = useMemo(() => {
    if (category !== 'LOAN' || !amount || !loanDetails.interestRate || !loanDetails.duration) return 0;
    
    const P = parseInt(amount.replace(/,/g, ''), 10); // 원금
    const r = parseFloat(loanDetails.interestRate) / 100 / 12; // 월 이자율
    const n = parseInt(loanDetails.duration, 10); // 기간 (개월)
    
    if (isNaN(P) || isNaN(r) || isNaN(n) || n === 0) return 0;

    // 원리금균등상환 공식
    if (loanDetails.method === 'EQUAL_PAYMENT') {
      if (r === 0) return P / n;
      return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    
    // 원금균등 (첫달 기준)
    if (loanDetails.method === 'EQUAL_PRINCIPAL') {
      return (P / n) + (P * r);
    }

    // 만기일시 (월 이자만)
    return P * r;
  }, [amount, loanDetails, category]);

  const resetForm = () => {
    setName('');
    setCategory('CASH');
    setAmount('');
    setColor(ASSET_COLORS[0]);
    setEditingId(null);
    setLoanDetails({
      interestRate: '',
      duration: '12',
      gracePeriod: '0',
      method: 'EQUAL_PAYMENT'
    });
    setIsAdding(false);
  };

  const handleSubmit = () => {
    if (assets.length >= 10 && !editingId) {
      alert('자산(계좌)은 최대 10개까지만 등록할 수 있어요! 😅');
      return;
    }

    if (!name || !amount) return;

    const numericAmount = parseInt(amount.replace(/,/g, ''), 10);

    // 수정 모드일 경우 기존 자산 삭제 후 새로 추가 (ID 유지를 위해선 store 수정이 필요하나 현재는 삭제 후 추가 방식 사용)
    if (editingId) {
      deleteAsset(editingId);
    }

    addAsset({
      name,
      category: category,
      balance: numericAmount,
      color,
      loanDetails: category === 'LOAN' ? loanDetails : undefined
    });

    resetForm();
  };

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setName(asset.name);
    setCategory(asset.category);
    setAmount(asset.balance.toLocaleString());
    setColor(asset.color);
    if (asset.loanDetails) {
      setLoanDetails(asset.loanDetails);
    }
    setIsAdding(true);
  };

  // 자산 카테고리별 그룹화
  const groupedAssets = assets.reduce((acc, asset) => {
    const cat = asset.category || 'CASH';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {} as Record<AssetCategory, Asset[]>);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Total Asset Header */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-lovely-500 opacity-20 rounded-full -mr-10 -mt-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl" />
        
        <p className="text-gray-400 text-sm font-medium mb-2">나의 순자산 (자산 - 부채)</p>
        <h2 className="text-3xl font-bold tracking-tight mb-6">{formatCurrency(netWorth)}원</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map(cat => {
            const catTotal = assets
              .filter(a => a.category === cat)
              .reduce((acc, c) => acc + c.balance, 0);
            const isLoan = cat === 'LOAN';
            
            return (
              <div key={cat} className={cn(
                "min-w-0 rounded-2xl px-3 py-2.5 border text-left backdrop-blur-sm",
                isLoan ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5"
              )}>
                <p className={cn("text-[10px] font-medium mb-0.5 whitespace-nowrap", isLoan ? "text-red-300" : "text-gray-400")}>
                  {ASSET_CATEGORY_LABELS[cat]}
                </p>
                <p className={cn(
                  "font-bold text-[13px] leading-tight tabular-nums whitespace-nowrap tracking-tight",
                  isLoan ? "text-red-200" : "text-white"
                )}>
                  {isLoan && catTotal > 0 ? '-' : ''}{formatCurrency(catTotal)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-6 px-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">자산 포트폴리오</h3>
          <button 
            onClick={() => {
              if (isAdding) resetForm();
              else setIsAdding(true);
            }} 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              isAdding ? "bg-gray-100 text-gray-500" : "bg-lovely-50 text-lovely-500 hover:bg-lovely-100"
            )}
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-lovely-100 animate-in zoom-in-95 duration-200">
            <div className="space-y-5">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                      category === cat 
                        ? (cat === 'LOAN' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white')
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {ASSET_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={category === 'LOAN' ? "부채 이름 (예: 전세자금대출)" : "자산 이름 (예: 월급 통장)"}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-lovely-200 transition-all"
                />
                
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="금액"
                    value={amount}
                    onChange={handleAmountChange}
                    className={cn(
                      "w-full p-4 bg-gray-50 rounded-2xl text-lg font-bold outline-none focus:ring-2 transition-all",
                      category === 'LOAN' ? "text-red-500 focus:ring-red-200" : "text-gray-800 focus:ring-lovely-200"
                    )}
                  />
                  {amount && (
                    <p className={cn("text-xs font-medium mt-1 text-right pr-2", category === 'LOAN' ? "text-red-400" : "text-lovely-500")}>
                      {numberToKorean(parseInt(amount.replace(/,/g, ''), 10))}
                    </p>
                  )}
                </div>

                {/* 부채 상세 입력 폼 */}
                {category === 'LOAN' && (
                  <div className="bg-red-50 p-4 rounded-2xl space-y-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                      <Calculator size={16} />
                      <span className="text-xs font-bold">대출 상세 설정</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-red-400 ml-1">연 이자율 (%)</label>
                        <input
                          type="number"
                          placeholder="0.0"
                          value={loanDetails.interestRate}
                          onChange={e => setLoanDetails({...loanDetails, interestRate: e.target.value})}
                          className="w-full p-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-red-400 ml-1">기간 (개월)</label>
                        <input
                          type="number"
                          placeholder="12"
                          value={loanDetails.duration}
                          onChange={e => setLoanDetails({...loanDetails, duration: e.target.value})}
                          className="w-full p-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-red-400 ml-1">상환 방식</label>
                      <div className="flex bg-white rounded-xl p-1 mt-1">
                        {[
                          { id: 'EQUAL_PAYMENT', label: '원리금균등' },
                          { id: 'EQUAL_PRINCIPAL', label: '원금균등' },
                          { id: 'BULK', label: '만기일시' }
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setLoanDetails({...loanDetails, method: m.id as any})}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
                              loanDetails.method === m.id ? "bg-red-500 text-white shadow-sm" : "text-gray-400 hover:bg-gray-50"
                            )}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {monthlyPayment > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-100 text-right">
                        <p className="text-[10px] text-red-400">월 예상 상환금 (첫 달 기준)</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(Math.round(monthlyPayment))}원</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Color Picker */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {ASSET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-transform active:scale-95",
                      c,
                      color === c ? "ring-2 ring-offset-2 ring-gray-300" : ""
                    )}
                  >
                    {color === c && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleSubmit} 
                className={cn(
                  "w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg transition-colors",
                  category === 'LOAN' 
                    ? "bg-red-500 shadow-red-200 hover:bg-red-600" 
                    : "bg-lovely-500 shadow-lovely-200 hover:bg-lovely-600"
                )}
              >
                {editingId ? '수정 완료' : (category === 'LOAN' ? '부채 등록하기' : '자산 추가하기')}
              </button>
            </div>
          </div>
        )}

        {(Object.keys(groupedAssets) as AssetCategory[]).map(cat => (
          <div key={cat} className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 ml-2">{ASSET_CATEGORY_LABELS[cat] || cat}</h4>
            {groupedAssets[cat].map(asset => (
              <div 
                key={asset.id} 
                onClick={() => handleEdit(asset)}
                className="bg-white p-5 rounded-[2rem] shadow-sm border border-lovely-50 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white",
                    asset.category === 'LOAN' ? "bg-red-500" : asset.color
                  )}>
                    {getIcon(asset.category)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{asset.name}</p>
                    {asset.category === 'LOAN' && asset.loanDetails && (
                      <p className="text-[10px] text-red-400">
                        연 {asset.loanDetails.interestRate}% · {asset.loanDetails.duration}개월
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    asset.category === 'LOAN' ? "text-red-500" : "text-gray-800"
                  )}>
                    {asset.category === 'LOAN' ? '-' : ''}{formatCurrency(asset.balance)}원
                  </p>
                  <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-xs text-gray-300 flex items-center gap-0.5">
                      <Pencil size={10} /> 수정
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
