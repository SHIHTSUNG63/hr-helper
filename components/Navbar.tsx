
import React from 'react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-bolt text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">HR 萬能抽籤分組</h1>
          <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">Efficiency Suite</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
        <TabButton 
          active={activeTab === AppTab.INPUT} 
          onClick={() => setActiveTab(AppTab.INPUT)}
          icon="fa-list-check"
          label="名單管理"
        />
        <TabButton 
          active={activeTab === AppTab.RAFFLE} 
          onClick={() => setActiveTab(AppTab.RAFFLE)}
          icon="fa-gift"
          label="獎品抽籤"
        />
        <TabButton 
          active={activeTab === AppTab.GROUPING} 
          onClick={() => setActiveTab(AppTab.GROUPING)}
          icon="fa-layer-group"
          label="自動分組"
        />
      </div>
    </nav>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
      ${active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }
    `}
  >
    <i className={`fa-solid ${icon}`}></i>
    <span>{label}</span>
  </button>
);

export default Navbar;
