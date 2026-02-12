
import React, { useState, useCallback, useMemo } from 'react';
import { AppTab, Participant, RaffleWinner, Group } from './types';
import ListInput from './components/ListInput';
import RaffleBoard from './components/RaffleBoard';
import GroupingBoard from './components/GroupingBoard';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.INPUT);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<RaffleWinner[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const handleUpdateParticipants = useCallback((newList: Participant[]) => {
    setParticipants(newList);
    // Reset winners and groups if list changes drastically
    setWinners([]);
    setGroups([]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="transition-all duration-300">
          {activeTab === AppTab.INPUT && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ListInput 
                onUpdate={handleUpdateParticipants} 
                initialParticipants={participants} 
              />
            </div>
          )}

          {activeTab === AppTab.RAFFLE && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {participants.length === 0 ? (
                <EmptyState onGoToInput={() => setActiveTab(AppTab.INPUT)} />
              ) : (
                <RaffleBoard 
                  participants={participants} 
                  onWinnerSelected={(winner) => setWinners(prev => [winner, ...prev])}
                  pastWinners={winners}
                />
              )}
            </div>
          )}

          {activeTab === AppTab.GROUPING && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {participants.length === 0 ? (
                <EmptyState onGoToInput={() => setActiveTab(AppTab.INPUT)} />
              ) : (
                <GroupingBoard 
                  participants={participants} 
                  onGroupsGenerated={setGroups}
                  existingGroups={groups}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto">
        &copy; {new Date().getFullYear()} HR Productivity Suite • Built with Gemini AI
      </footer>
    </div>
  );
};

const EmptyState: React.FC<{ onGoToInput: () => void }> = ({ onGoToInput }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <i className="fa-solid fa-users text-slate-400 text-3xl"></i>
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">名單目前為空</h3>
    <p className="text-slate-500 mb-8 max-w-xs text-center">
      請先前往「名單管理」上傳 CSV 或輸入姓名。
    </p>
    <button 
      onClick={onGoToInput}
      className="px-6 py-2 gradient-bg text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-all"
    >
      前往匯入名單
    </button>
  </div>
);

export default App;
