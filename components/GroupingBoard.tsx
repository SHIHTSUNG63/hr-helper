
import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface GroupingBoardProps {
  participants: Participant[];
  onGroupsGenerated: (groups: Group[]) => void;
  existingGroups: Group[];
}

const GroupingBoard: React.FC<GroupingBoardProps> = ({ participants, onGroupsGenerated, existingGroups }) => {
  const [groupCount, setGroupCount] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAIThemes, setUseAIThemes] = useState(false);

  const handleGenerateGroups = async () => {
    setIsGenerating(true);
    
    // Shuffle logic
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
      id: `group-${Date.now()}-${i}`,
      name: `第 ${i + 1} 組`,
      members: []
    }));

    // Distribute
    shuffled.forEach((p, idx) => {
      newGroups[idx % groupCount].members.push(p);
    });

    if (useAIThemes) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `為這 ${groupCount} 個小組分別生成一個有趣的「中文組名」和「一個組隊口號」。主題要是適合辦公室團隊建設或派對。`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: '組名',
                  },
                  slogan: {
                    type: Type.STRING,
                    description: '口號',
                  },
                },
                required: ["name", "slogan"],
              },
            },
          }
        });

        const themes = JSON.parse(response.text || '[]');
        if (Array.isArray(themes)) {
          newGroups.forEach((g, i) => {
            if (themes[i]) {
              g.name = themes[i].name;
              g.theme = themes[i].slogan;
            }
          });
        }
      } catch (error) {
        console.error("AI Theme generation failed", error);
      }
    }

    onGroupsGenerated(newGroups);
    setIsGenerating(false);
  };

  const handleDownloadCSV = () => {
    if (existingGroups.length === 0) return;

    let csvContent = "組名,組員姓名,組隊口號\n";
    existingGroups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `"${group.name}","${member.name}","${group.theme || ''}"\n`;
      });
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">分組實驗室</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">預計組數</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setGroupCount(Math.max(2, groupCount - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="text-2xl font-black text-indigo-600 w-12 text-center">{groupCount}</span>
              <button 
                onClick={() => setGroupCount(Math.min(participants.length, groupCount + 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <button 
              onClick={() => setUseAIThemes(!useAIThemes)}
              className={`w-12 h-6 rounded-full transition-colors relative ${useAIThemes ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useAIThemes ? 'translate-x-6' : ''}`} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-indigo-900 flex items-center gap-1">
                AI 趣味命名
                <i className="fa-solid fa-sparkles text-xs text-indigo-500"></i>
              </span>
              <span className="text-[10px] text-indigo-400">使用 Gemini 生成創意組名</span>
            </div>
          </div>

          <button
            onClick={handleGenerateGroups}
            disabled={isGenerating || participants.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3
              ${isGenerating 
                ? 'bg-slate-200 text-slate-400' 
                : 'gradient-bg text-white hover:shadow-indigo-200/50'
              }
            `}
          >
            {isGenerating ? <i className="fa-solid fa-dna fa-spin"></i> : <i className="fa-solid fa-shuffle"></i>}
            {isGenerating ? '正在計算最優解...' : '立即自動分組'}
          </button>
        </div>
      </div>

      {existingGroups.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-700">分組結果</h3>
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all"
            >
              <i className="fa-solid fa-download"></i>
              下載 CSV 紀錄
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-700">
            {existingGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {group.name}
                    </h3>
                    {group.theme && (
                      <p className="text-xs text-indigo-500 font-medium mt-1 italic">
                        " {group.theme} "
                      </p>
                    )}
                  </div>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg">
                    {group.members.length} 人
                  </span>
                </div>
                
                <div className="space-y-2">
                  {group.members.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                      <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] text-slate-400 font-bold">
                        {i + 1}
                      </div>
                      <span className="text-slate-700 font-medium text-sm">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupingBoard;
