
import React, { useState, useMemo } from 'react';
import { Participant } from '../types';

interface ListInputProps {
  onUpdate: (participants: Participant[]) => void;
  initialParticipants: Participant[];
}

const ListInput: React.FC<ListInputProps> = ({ onUpdate, initialParticipants }) => {
  const [textInput, setTextInput] = useState(
    initialParticipants.map(p => p.name).join('\n')
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const MOCK_NAMES = [
    "陳小明", "林美玲", "張大為", "李宜芳", "王志強", 
    "吳淑芬", "劉建國", "蔡佩君", "楊信宏", "許家豪",
    "鄭雅雯", "謝承恩", "郭思妤", "洪振宇", "曾郁婷"
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const handleSave = () => {
    const names = textInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n !== '');
    
    const newParticipants: Participant[] = names.map((name, index) => ({
      id: `p-${Date.now()}-${index}`,
      name,
    }));

    onUpdate(newParticipants);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleLoadMockData = () => {
    setTextInput(MOCK_NAMES.join('\n'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const names = content
        .split(/\r?\n/)
        .map(line => line.split(',')[0].trim())
        .filter(n => n !== '' && n !== 'name' && n !== '姓名');
      
      setTextInput(names.join('\n'));
    };
    reader.readAsText(file);
  };

  const duplicates = useMemo(() => {
    const nameCounts = new Map<string, number>();
    initialParticipants.forEach(p => {
      nameCounts.set(p.name, (nameCounts.get(p.name) || 0) + 1);
    });
    return nameCounts;
  }, [initialParticipants]);

  const hasDuplicates = useMemo(() => {
    return Array.from(duplicates.values()).some(count => count > 1);
  }, [duplicates]);

  const handleRemoveDuplicates = () => {
    const seen = new Set<string>();
    const uniqueParticipants = initialParticipants.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    onUpdate(uniqueParticipants);
    setTextInput(uniqueParticipants.map(p => p.name).join('\n'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-slate-800">名單匯入</h2>
          <button 
            onClick={handleLoadMockData}
            className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all"
          >
            使用範例名單
          </button>
        </div>
        <p className="text-slate-500 mb-6 text-sm">手動輸入姓名（一人一行）或上傳 CSV 檔案。</p>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            姓名清單
          </label>
          <textarea
            className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"
            placeholder="例如：&#10;王小明&#10;李大華&#10;張美麗"
            value={textInput}
            onChange={handleTextChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 gradient-bg text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isSuccess ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-floppy-disk"></i>}
            {isSuccess ? '已儲存！' : '儲存名單'}
          </button>
          
          <label className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2">
            <i className="fa-solid fa-file-csv text-green-600"></i>
            上傳 CSV
            <input 
              type="file" 
              accept=".csv,.txt" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>
      </div>

      <div className="bg-slate-100/50 rounded-3xl p-8 border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">當前預覽</h2>
          <div className="flex items-center gap-2">
            {hasDuplicates && (
              <button 
                onClick={handleRemoveDuplicates}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200 transition-all flex items-center gap-1"
              >
                <i className="fa-solid fa-trash-can"></i>
                移除重複
              </button>
            )}
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
              共 {initialParticipants.length} 人
            </span>
          </div>
        </div>

        {initialParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
            <i className="fa-solid fa-users-slash text-5xl mb-4"></i>
            <p>尚未建立任何名單</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {initialParticipants.map((p, i) => {
              const isDuplicate = (duplicates.get(p.name) || 0) > 1;
              return (
                <div 
                  key={p.id} 
                  className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 transition-colors ${
                    isDuplicate ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isDuplicate ? 'text-red-300' : 'text-slate-300'}`}>#{i + 1}</span>
                  <span className={`font-medium ${isDuplicate ? 'text-red-700' : 'text-slate-700'}`}>{p.name}</span>
                  {isDuplicate && <i className="fa-solid fa-circle-exclamation text-red-400 text-[10px] ml-auto"></i>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListInput;
