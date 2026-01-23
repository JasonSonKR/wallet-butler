import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { ASSET_CATEGORY_LABELS, AssetCategory } from '../types/ledger';
import { Building2, Landmark, Wallet, Plus, Check } from 'lucide-react';

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
  const { assets, transactions, getTotalAssets, addAsset, deleteAsset } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'CASH' as AssetCategory, balance: '', color: ASSET_COLORS[0] });

  const totalAssets = getTotalAssets();

  const getIcon = (category: AssetCategory) => {
    switch (category) {
      case 'REAL_ESTATE': return <Building2 size={20} className="text-white" />;
      case 'FINANCE': return <Landmark size={20} className="text-white" />;
      case 'CASH': return <Wallet size={20} className="text-white" />;
    }
  };

  const handleAdd = () => {
    if (assets.length >= 10) {
      alert('자산(계좌)은 최대 10개까지만 등록할 수 있어요! 😅');
      return;
    }

    if (!newAsset.name || !newAsset.balance) return;
    addAsset({
      name: newAsset.name,
      category: newAsset.category,
      balance: Number(newAsset.balance.replace(/[^0-9-]/g, '')),
      color: newAsset.color
    });
    setIsAdding(false);
    setNewAsset({ name: '', category: 'CASH', balance: '', color: ASSET_COLORS[0] });
  };

  // 자산 카테고리별 그룹화
  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<AssetCategory, typeof assets>);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Total Asset Header */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-lovely-500 opacity-20 rounded-full -mr-10 -mt-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl" />
        
        <p className="text-gray-400 text-sm font-medium mb-2">나의 총 자산</p>
        <h2 className="text-3xl font-bold tracking-tight mb-6">{formatCurrency(totalAssets)}원</h2>
        
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map(cat => {
            const catTotal = assets.filter(a => a.category === cat).reduce((acc, c) => acc + c.balance, 0);
            return (
              <div key={cat} className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[10px] text-gray-400 mb-1">{ASSET_CATEGORY_LABELS[cat]}</p>
                <p className="font-bold text-sm">{formatCurrency(catTotal)}</p>
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
            onClick={() => setIsAdding(!isAdding)} 
            className="w-8 h-8 rounded-full bg-lovely-50 text-lovely-500 flex items-center justify-center hover:bg-lovely-100 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-lovely-100 animate-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewAsset({ ...newAsset, category: cat })}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                      newAsset.category === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {ASSET_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="자산 이름 (예: 강남 아파트)"
                value={newAsset.name}
                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-lovely-200 transition-all"
              />
              <input
                type="text"
                placeholder="금액"
                value={newAsset.balance}
                onChange={e => setNewAsset({ ...newAsset, balance: e.target.value })}
                className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-lovely-200 transition-all"
              />
              
              {/* Color Picker */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {ASSET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewAsset({ ...newAsset, color })}
                    className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-transform active:scale-95",
                      color,
                      newAsset.color === color ? "ring-2 ring-offset-2 ring-gray-300" : ""
                    )}
                  >
                    {newAsset.color === color && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>

              <button onClick={handleAdd} className="w-full py-4 bg-lovely-500 rounded-2xl text-sm font-bold text-white shadow-lg shadow-lovely-200 hover:bg-lovely-600 transition-colors">
                자산 추가하기
              </button>
            </div>
          </div>
        )}

        {(Object.keys(groupedAssets) as AssetCategory[]).map(cat => (
          <div key={cat} className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 ml-2">{ASSET_CATEGORY_LABELS[cat]}</h4>
            {groupedAssets[cat].map(asset => (
              <div key={asset.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-lovely-50 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${asset.color} rounded-2xl flex items-center justify-center shadow-md text-white`}>
                    {getIcon(asset.category)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(asset.balance)}원</p>
                  <button onClick={() => deleteAsset(asset.id)} className="text-xs text-gray-300 hover:text-lovely-500 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
