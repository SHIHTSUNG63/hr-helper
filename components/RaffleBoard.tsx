
// Import missing useMemo hook
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Participant, RaffleWinner } from '../types';

interface RaffleBoardProps {
  participants: Participant[];
  onWinnerSelected: (winner: RaffleWinner) => void;
  pastWinners: RaffleWinner[];
}

const RaffleBoard: React.FC<RaffleBoardProps> = ({ participants, onWinnerSelected, pastWinners }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeName, setPrizeName] = useState('特獎 💰');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [currentDisplayNames, setCurrentDisplayNames] = useState<string[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  
  const spinInterval = useRef<number | null>(null);

  // Filter out past winners if duplicates are not allowed
  const availableParticipants = useMemo(() => {
    if (allowDuplicates) return participants;
    const winnerIds = new Set(pastWinners.map(w => w.participant.id));
    return participants.filter(p => !winnerIds.has(p.id));
  }, [participants, pastWinners, allowDuplicates]);

  const startSpin = () => {
    if (availableParticipants.length === 0) {
      alert("沒有可抽籤的人選了！");
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    
    let counter = 0;
    spinInterval.current = window.setInterval(() => {
      // Pick random names for animation
      const randomNames = Array.from({ length: 5 }, () => {
        const idx = Math.floor(Math.random() * availableParticipants.length);
        return availableParticipants[idx].name;
      });
      setCurrentDisplayNames(randomNames);
      counter++;

      // Slowly increase delay or just stop after a while
      if (counter > 30) {
        stopSpin();
      }
    }, 100);
  };

  const stopSpin = useCallback(() => {
    if (spinInterval.current) {
      clearInterval(spinInterval.current);
      spinInterval.current = null;
    }

    const luckyWinner = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
    setWinner(luckyWinner);
    setIsSpinning(false);
    
    onWinnerSelected({
      participant: luckyWinner,
      prizeName,
      timestamp: new Date()
    });
  }, [availableParticipants, prizeName, onWinnerSelected]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6">抽籤設定</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">獎項名稱</label>
              <input 
                type="text" 
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="例如：頭獎 10,000 元"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">允許重複抽中</span>
              <button 
                onClick={() => setAllowDuplicates(!allowDuplicates)}
                className={`w-12 h-6 rounded-full transition-colors relative ${allowDuplicates ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${allowDuplicates ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            
            <div className="pt-4">
              <button
                disabled={isSpinning || availableParticipants.length === 0}
                onClick={startSpin}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3
                  ${isSpinning || availableParticipants.length === 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'gradient-bg text-white hover:scale-[1.02] active:scale-95'
                  }
                `}
              >
                <i className={`fa-solid ${isSpinning ? 'fa-spinner fa-spin' : 'fa-clover'}`}></i>
                {isSpinning ? '正在抽取...' : '開始抽籤'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fa-solid fa-trophy text-9xl -mr-10 -mt-10"></i>
          </div>
          <h3 className="text-lg font-bold mb-4 relative z-10">候選統計</h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl">
              <p className="text-indigo-200 text-xs uppercase font-bold mb-1">總人數</p>
              <p className="text-2xl font-bold">{participants.length}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <p className="text-indigo-200 text-xs uppercase font-bold mb-1">剩餘名額</p>
              <p className="text-2xl font-bold">{availableParticipants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Center: The Board */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-[2rem] p-1 shadow-2xl border-4 border-indigo-100 flex items-center justify-center min-h-[400px] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          {winner ? (
            <div className="text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200 border-4 border-white animate-bounce">
                <i className="fa-solid fa-crown text-white text-4xl"></i>
              </div>
              <h2 className="text-slate-500 font-bold uppercase tracking-widest mb-2">{prizeName} 得主</h2>
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text gradient-bg">
                {winner.name}
              </h1>
              <div className="mt-8 flex gap-3 justify-center">
                 <span className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">恭喜發財</span>
                 <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">萬事如意</span>
              </div>
            </div>
          ) : isSpinning ? (
            <div className="flex flex-col items-center">
              <div className="h-24 overflow-hidden relative w-64 mask-fade">
                <div className="flex flex-col items-center gap-4 animate-slot">
                  {currentDisplayNames.map((name, i) => (
                    <span key={i} className="text-4xl font-bold text-slate-300 h-24 flex items-center">{name}</span>
                  ))}
                </div>
              </div>
              <p className="mt-8 text-indigo-500 font-medium animate-pulse">運氣加載中...</p>
            </div>
          ) : (
            <div className="text-center text-slate-300">
              <i className="fa-solid fa-gift text-8xl mb-6 opacity-20"></i>
              <p className="text-xl font-bold">準備好抽獎了嗎？</p>
            </div>
          )}
        </div>

        {/* Bottom: History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">中獎紀錄</h3>
            <span className="text-xs text-slate-400">最近 {pastWinners.length} 筆</span>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {pastWinners.length === 0 ? (
              <p className="text-center py-10 text-slate-300 italic">目前尚無得獎者</p>
            ) : (
              pastWinners.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {pastWinners.length - i}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{w.participant.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{w.prizeName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {w.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleBoard;
