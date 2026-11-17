import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

export const SettingsView = () => {
  const { assets, transactions, reset, setAllData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      assets,
      transactions,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lovely-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (Array.isArray(data.assets) && Array.isArray(data.transactions)) {
            if (window.confirm(`백업 파일에서 데이터를 복원하시겠습니까?\n- 자산: ${data.assets.length}개\n- 내역: ${data.transactions.length}개\n\n현재 데이터는 덮어씌워집니다.`)) {
                setAllData({
                    assets: data.assets,
                    transactions: data.transactions
                });
                alert('데이터가 성공적으로 복원되었습니다! ✨');
            }
        } else {
            alert('올바르지 않은 백업 파일 형식입니다.');
        }
      } catch (err) {
        console.error(err);
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('정말 모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다! 😱')) {
      reset();
      alert('초기화되었습니다.');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-lovely-100">
        <h2 className="text-xl font-extrabold text-gray-800 mb-2">데이터 관리</h2>
        <p className="text-sm text-gray-500 mb-6">
          소중한 가계부 데이터를 백업하고 복원하세요.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleExport}
            className="w-full p-4 bg-lovely-50 hover:bg-lovely-100 rounded-2xl flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lovely-500 shadow-sm group-hover:scale-110 transition-transform">
                <Download size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">데이터 백업하기</p>
                <p className="text-xs text-gray-400">현재 데이터를 파일로 저장합니다</p>
              </div>
            </div>
          </button>

          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 bg-lavender-50 hover:bg-lavender-100 rounded-2xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lavender-500 shadow-sm group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">데이터 복원하기</p>
                  <p className="text-xs text-gray-400">백업 파일을 불러옵니다</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-red-100">
        <h2 className="text-xl font-extrabold text-gray-800 mb-2">위험 구역</h2>
        <p className="text-sm text-gray-500 mb-6">
          데이터를 삭제하면 복구할 수 없습니다.
        </p>
        
        <button 
          onClick={handleReset}
          className="w-full p-4 bg-red-50 hover:bg-red-100 rounded-2xl flex items-center justify-between transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
              <Trash2 size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-red-600">모든 데이터 초기화</p>
              <p className="text-xs text-red-400">신중하게 선택해주세요</p>
            </div>
          </div>
          <AlertTriangle size={20} className="text-red-300" />
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-300 py-4 space-y-1">
        <p className="font-bold text-gray-400">🌸 Lovely Ledger</p>
        <p>모든 기록은 이 기기 브라우저에만 저장돼요</p>
      </div>
    </div>
  );
};