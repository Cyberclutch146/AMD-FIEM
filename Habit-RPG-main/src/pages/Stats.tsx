import React, { useMemo, useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { gameEngine } from '../lib/gameEngine';

const TABS = ["TRENDS", "PATTERNS", "PREDICTIONS"];

// Removed unused ALL_SKILLS

export const Stats: React.FC = () => {
  const user = useUserStore(state => state.user);
  const logs = useHabitStore(state => state.logs);
  const [activeTab, setActiveTab] = useState("TRENDS");

  const { chartData, maxDailyDrop, totalXp30Days } = useMemo(() => {
    const days: { date: string, xp: number }[] = [];
    let max = 0;
    let total30 = 0;
    
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().split('T')[0], xp: 0 });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyStr = thirtyDaysAgo.toISOString().split('T')[0];

    logs.forEach(log => {
      const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toISOString().split('T')[0] : 
                       (log.timestamp instanceof Date ? log.timestamp.toISOString().split('T')[0] : 
                       new Date(log.timestamp).toISOString().split('T')[0]);
      
      const xp = log.healthScoreAwarded || 10;
      if (dateStr >= thirtyStr) total30 += xp;
      
      const bucket = days.find(d => d.date === dateStr);
      if (bucket) {
        bucket.xp += xp;
        if (bucket.xp > max) max = bucket.xp;
      }
    });

    return { chartData: days, maxDailyDrop: max || 100, totalXp30Days: total30 };
  }, [logs]);

  const chartHeight = 120;
  const chartWidth = 300;
  
  const generatePath = () => {
    if (chartData.length === 0) return "";
    const step = chartWidth / (chartData.length - 1);
    return chartData.map((d, i) => {
      const x = i * step;
      const h = (d.xp / maxDailyDrop) * chartHeight;
      const y = chartHeight - h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };



  // Removed equipItem and unlockSkill since they are no longer used

  return (
    <>
      <TopBar />
      <main className="pt-20 pb-32 px-4 w-full flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        
        {/* Dynamic Avatar Block */}
        <section className="bg-surface-container rounded-xl shadow-xl border border-outline-variant/10 relative overflow-hidden h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="z-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-surface-container-highest border-2 border-primary rounded-full flex items-center justify-center flex-col blood-shadow mb-2 shadow-2xl relative">
                  <span className="material-symbols-outlined text-4xl text-on-surface">person</span>
                </div>
                <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase">{user?.name || "HERO"}</h2>
                <p className="text-[10px] text-primary font-bold tracking-widest uppercase">COMMANDER</p>
            </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex bg-surface-container-high rounded-full p-1 sticky top-0 z-30 shadow-lg border border-outline-variant/10">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-full transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-xl' 
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab View: TRENDS */}
        {activeTab === "TRENDS" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">

                <section className="bg-surface-container rounded-xl overflow-hidden shadow-2xl relative border border-outline-variant/10">
                <div className="p-4 flex justify-between items-center">
                    <div>
                    <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface">Health Score Flow</h2>
                    </div>
                    <span className="bg-primary-container text-primary px-2 py-1 text-[9px] font-bold uppercase rounded">{totalXp30Days} (30D)</span>
                </div>
                <div className="h-32 w-full relative px-4 pb-4">
                    <div className="absolute inset-x-4 inset-y-0 flex flex-col justify-between opacity-10 pointer-events-none pb-4">
                    <div className="border-t border-secondary"></div>
                    <div className="border-t border-secondary"></div>
                    <div className="border-t border-secondary"></div>
                    </div>
                    
                    <div className="relative w-full h-full flex items-end pt-2">
                    <svg viewBox={`0 -10 ${chartWidth} ${chartHeight + 20}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0" />
                        </linearGradient>
                        </defs>
                        <path d={`${generatePath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#gradient)" />
                        <path d={generatePath()} fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(209,54,57,0.8)]" />
                        {chartData.map((d, i) => {
                            const x = i * (chartWidth / (chartData.length - 1));
                            const y = chartHeight - ((d.xp / maxDailyDrop) * chartHeight);
                            if(isNaN(x) || isNaN(y)) return null;
                            return <circle key={i} cx={x} cy={y} r="4" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-primary)" strokeWidth="2" />
                        })}
                    </svg>
                    </div>
                    <div className="absolute bottom-0 left-4 right-4 flex justify-between text-[8px] text-secondary font-mono tracking-tighter">
                    {chartData.map((d, i) => (<span key={i}>{d.date.split('-').slice(1).join('/')}</span>))}
                    </div>
                </div>
                </section>
            </div>
        )}

        {/* Tab View: PATTERNS */}
        {activeTab === "PATTERNS" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/10 shadow-xl">
                    <h2 className="text-sm font-black text-on-surface tracking-tighter uppercase flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Behavior Patterns
                    </h2>
                    
                    {gameEngine.detectPatterns(logs).length === 0 ? (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-secondary/30 block mb-2">monitoring</span>
                            <p className="text-xs text-secondary font-bold uppercase tracking-widest">Not enough data.<br/>Keep logging meals to find patterns!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {gameEngine.detectPatterns(logs).map((pattern, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border-2 border-primary/30 bg-primary/5`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded shadow-inner flex items-center justify-center bg-primary/20`}>
                                           <span className={`material-symbols-outlined text-primary`}>psychology</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface text-sm">Insight Discovered</p>
                                            <p className={`text-xs text-secondary font-medium`}>
                                                {pattern}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Tab View: PREDICTIONS */}
        {activeTab === "PREDICTIONS" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                 <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <div>
                        <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">Active Risk Status</p>
                        <p className="text-lg font-black text-amber-500 tracking-tighter">{gameEngine.predictRisk(logs)}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className={`flex items-center p-4 rounded-xl border-2 border-outline-variant/10 bg-surface-container-high`}>
                        <div className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-inner mr-4 bg-surface-container-lowest text-secondary`}>
                            <span className="material-symbols-outlined">health_and_safety</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-black tracking-tighter text-on-surface">Health Forecasting</p>
                            <p className="text-[10px] font-bold text-secondary">Based on recent logs, we calculate trajectory and alert you of risky patterns before they happen.</p>
                        </div>
                    </div>
                 </div>
            </div>
        )}

      </main>
      <BottomNav />
    </>
  );
};
