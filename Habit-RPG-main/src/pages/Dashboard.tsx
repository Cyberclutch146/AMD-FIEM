import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { useUserStore } from '../store/useUserStore';
import { AddHabitModal } from '../components/dashboard/AddHabitModal';
import { gameEngine } from '../lib/gameEngine';

export const Dashboard: React.FC = () => {
  const habits = useHabitStore(state => state.habits);
  const loading = useHabitStore(state => state.loading);
  const logs = useHabitStore(state => state.logs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useUserStore(state => state.user);

  const healthScore = user?.healthScore || 0;
  const streak = user?.streak || 0;
  const scorePercent = Math.min(100, healthScore);
  const lastCheckInMs = user?.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : null;
  const currentSuggestion = gameEngine.generateSuggestions(lastCheckInMs, new Date());

  // Today's food logs
  const todayLogs = logs.filter(log => {
    if (!log.timestamp) return false;
    const logDate = log.timestamp instanceof Date ? log.timestamp
      : log.timestamp.toDate ? log.timestamp.toDate()
      : new Date(log.timestamp);
    return logDate.toDateString() === new Date().toDateString();
  });

  const todayFoodEntries = todayLogs.map(log => {
    const habit = habits.find(h => h.id === log.habitId);
    return {
      id: log.id,
      name: habit?.title || 'Unknown',
      mealTime: log.mealTime || 'Snack',
      foodType: log.foodType || 'Healthy',
      healthScore: log.healthScoreAwarded || 0,
    };
  });

  const getMealIcon = (t: string) => {
    switch (t) { case 'Morning': return 'bakery_dining'; case 'Afternoon': return 'lunch_dining'; case 'Night': return 'dinner_dining'; default: return 'fastfood'; }
  };
  const getMealLabel = (t: string) => {
    switch (t) { case 'Morning': return 'Breakfast'; case 'Afternoon': return 'Lunch'; case 'Night': return 'Dinner'; default: return 'Snack'; }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <main className="p-6 lg:p-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Smart Food Decision System — {currentDate}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Log Meal
        </button>
      </div>

      {/* ====== BENTO GRID ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ---- HEALTH SCORE (4 cols) ---- */}
        <section className="lg:col-span-4 glass-card p-8 relative overflow-hidden aurora-glow">
          <h3 className="relative z-10 text-lg font-display font-bold text-slate-200 mb-8">Health Score</h3>

          {/* Circular Chart */}
          <div className="relative z-10 w-full max-w-[220px] mx-auto aspect-square flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4edea3" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle" stroke="url(#scoreGrad)"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeDasharray={`${scorePercent}, 100`}
                style={{ filter: 'drop-shadow(0 0 6px rgba(78, 222, 163, 0.5))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                {healthScore}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">/100</span>
            </div>
          </div>

          {/* Streak */}
          <div className="relative z-10 bg-white/[0.04] rounded-xl p-4 flex items-center gap-4 border border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Consistency Streak</p>
              <p className="text-lg font-display font-bold text-emerald-400">{streak} Days</p>
            </div>
          </div>
        </section>

        {/* ---- 30-DAY TRAJECTORY (8 cols) ---- */}
        <section className="lg:col-span-8 glass-card p-8 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-200">30-Day Trajectory</h3>
              <p className="text-sm text-slate-500 mt-0.5">Metabolic response vs. baseline</p>
            </div>
            <div className="flex gap-1.5">
              {['W', 'M', 'Y'].map((label, i) => (
                <button key={label} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  i === 1 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-white/[0.04] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] border border-transparent'
                }`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-[220px] rounded-xl overflow-hidden bg-gradient-to-t from-emerald-500/[0.06] to-transparent border-b border-emerald-500/20">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 C10,75 20,70 30,72 C40,74 45,85 55,65 C65,45 70,50 80,35 C90,20 95,22 100,18 L100,100 L0,100 Z" fill="url(#chartFill)" />
              <path d="M0,80 C10,75 20,70 30,72 C40,74 45,85 55,65 C65,45 70,50 80,35 C90,20 95,22 100,18" fill="none" stroke="#4edea3" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(78,222,163,0.6))' }} />
              {/* Data points */}
              <circle cx="30" cy="72" r="1.5" fill="#4edea3" />
              <circle cx="55" cy="65" r="1.5" fill="#4edea3" />
              <circle cx="80" cy="35" r="1.5" fill="#4edea3" />
              <circle cx="100" cy="18" r="2" fill="#4edea3" style={{ filter: 'drop-shadow(0 0 4px rgba(78,222,163,0.8))' }} />
            </svg>
          </div>
        </section>

        {/* ---- PROACTIVE INSIGHTS (6 cols) ---- */}
        <section className="lg:col-span-6 glass-card p-8 accent-border-left relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-[0.04]">
            <span className="material-symbols-outlined text-[120px] text-white">auto_awesome</span>
          </div>
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">lightbulb</span>
            </div>
            <h3 className="text-sm font-display font-bold text-purple-300 uppercase tracking-wider">Proactive Insights</h3>
          </div>
          <p className="text-[15px] text-slate-300 leading-relaxed relative z-10 mb-6">
            {currentSuggestion}
          </p>
          <div className="flex gap-3 relative z-10">
            <button className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
              View Details
            </button>
            <button className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
              Set Reminder
            </button>
          </div>
        </section>

        {/* ---- TODAY'S FOOD LOG (6 cols) ---- */}
        <section className="lg:col-span-6 glass-card p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <h3 className="text-lg font-display font-bold text-slate-200">Today's Food Log</h3>
            <span className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors">View All</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[60px] rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
              ))
            ) : todayFoodEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-600">restaurant</span>
                </div>
                <p className="text-sm font-medium text-slate-400">No meals logged today</p>
                <p className="text-xs text-slate-600 mt-1">Click "Log Meal" to get started</p>
              </div>
            ) : (
              todayFoodEntries.map(entry => (
                <div key={entry.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors hover:bg-white/[0.04] ${
                    entry.foodType === 'Junk' ? 'bg-red-500/[0.04] border-red-500/15' : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">{getMealIcon(entry.mealTime)}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-200">{getMealLabel(entry.mealTime)}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{entry.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      entry.foodType === 'Healthy' ? 'bg-emerald-500/15 text-emerald-400' :
                      entry.foodType === 'Junk' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-cyan-500/15 text-cyan-400'
                    }`}>
                      {entry.foodType === 'Healthy' ? 'Healthy' : entry.foodType === 'Junk' ? 'Processed' : 'Hydration'}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-400">+{entry.healthScore}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
};
