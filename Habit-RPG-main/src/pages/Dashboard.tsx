import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { useUserStore } from '../store/useUserStore';
import { AddHabitModal } from '../components/dashboard/AddHabitModal';
import { gameEngine } from '../lib/gameEngine';

export const Dashboard: React.FC = () => {
  const loading = useHabitStore(state => state.loading);
  const logs = useHabitStore(state => state.logs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useUserStore(state => state.user);

  const healthScore = user?.healthScore || 0;
  const streak = user?.streak || 0;
  const consistencyScore = user?.consistencyScore || 0;
  const scorePercent = Math.min(100, Math.max(0, healthScore));
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
    return {
      id: log.id,
      mealTime: log.mealTime || 'Snack',
      foodType: log.foodType || 'Healthy',
      healthScore: log.healthScoreAwarded || 0,
      time: log.timestamp instanceof Date ? log.timestamp
        : log.timestamp?.toDate ? log.timestamp.toDate()
        : new Date(log.timestamp),
    };
  });

  const getMealIcon = (t: string) => {
    switch (t) { case 'Morning': return '🌅'; case 'Afternoon': return '☀️'; case 'Night': return '🌙'; default: return '🍎'; }
  };
  const getMealLabel = (t: string) => {
    switch (t) { case 'Morning': return 'Breakfast'; case 'Afternoon': return 'Lunch'; case 'Night': return 'Dinner'; default: return 'Snack'; }
  };
  const getFoodLabel = (t: string) => {
    switch (t) { case 'Healthy': return '🥗 Healthy'; case 'Junk': return '🍔 Processed'; case 'Water': return '💧 Water'; default: return t; }
  };
  const getTimeStr = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Score color
  const getScoreColor = () => {
    if (healthScore >= 70) return 'from-emerald-400 to-cyan-400';
    if (healthScore >= 40) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-orange-400';
  };
  const getScoreStroke = () => {
    if (healthScore >= 70) return '#4edea3';
    if (healthScore >= 40) return '#fbbf24';
    return '#f87171';
  };

  // Weekly summary
  const weeklyHealthy = logs.filter(l => l.foodType === 'Healthy').length;
  const weeklyJunk = logs.filter(l => l.foodType === 'Junk').length;
  const totalMeals = logs.length;

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <main className="p-6 lg:p-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">{currentDate}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Log Meal
        </button>
      </div>

      {/* ====== STATS ROW ====== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/[0.06] rounded-full blur-2xl pointer-events-none" />
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Health Score</p>
          <p className={`text-3xl font-display font-extrabold mt-1 bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`}>{healthScore}</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700" style={{ width: `${scorePercent}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="glass-card p-5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Streak</p>
          <p className="text-3xl font-display font-extrabold mt-1 text-cyan-400">{streak}</p>
          <p className="text-[11px] text-slate-600 mt-2">days in a row</p>
        </div>

        {/* Healthy Meals */}
        <div className="glass-card p-5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Healthy Meals</p>
          <p className="text-3xl font-display font-extrabold mt-1 text-emerald-400">{weeklyHealthy}</p>
          <p className="text-[11px] text-slate-600 mt-2">logged total</p>
        </div>

        {/* Junk Meals */}
        <div className="glass-card p-5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Junk Meals</p>
          <p className="text-3xl font-display font-extrabold mt-1 text-amber-400">{weeklyJunk}</p>
          <p className="text-[11px] text-slate-600 mt-2">of {totalMeals} total</p>
        </div>
      </div>

      {/* ====== MAIN GRID ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ---- HEALTH GAUGE (5 cols) ---- */}
        <section className="lg:col-span-5 glass-card p-8 relative overflow-hidden aurora-glow">
          <h3 className="relative z-10 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Overall Health</h3>

          {/* Circular Chart */}
          <div className="relative z-10 w-full max-w-[200px] mx-auto aspect-square flex items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={getScoreStroke()} />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle" stroke="url(#scoreGrad)"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeDasharray={`${scorePercent}, 100`}
                style={{ filter: `drop-shadow(0 0 6px ${getScoreStroke()}80)`, transition: 'stroke-dasharray 0.7s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-display font-extrabold bg-gradient-to-b ${getScoreColor()} bg-clip-text text-transparent`}>
                {healthScore}
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">/100</span>
            </div>
          </div>

          {/* Score Description */}
          <div className="relative z-10 text-center">
            <p className="text-sm font-medium text-slate-300">
              {healthScore >= 80 ? '🌟 Excellent! Keep it up!' :
               healthScore >= 60 ? '💪 Good progress!' :
               healthScore >= 30 ? '📊 Room for improvement' :
               healthScore > 0 ? '🍽️ Log more healthy meals' :
               '🚀 Start logging to build your score'}
            </p>
          </div>
        </section>

        {/* ---- PROACTIVE INSIGHT (7 cols) ---- */}
        <section className="lg:col-span-7 glass-card p-8 accent-border-left relative overflow-hidden flex flex-col">
          <div className="absolute -top-4 -right-4 opacity-[0.04]">
            <span className="material-symbols-outlined text-[120px] text-white">auto_awesome</span>
          </div>
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">lightbulb</span>
            </div>
            <h3 className="text-sm font-display font-bold text-purple-300 uppercase tracking-wider">Smart Insight</h3>
          </div>
          <p className="text-[15px] text-slate-300 leading-relaxed relative z-10 flex-1">
            {currentSuggestion}
          </p>

          {/* Quick stats */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-emerald-400">{todayFoodEntries.length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Today's Meals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-cyan-400">{consistencyScore}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Consistency</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-purple-400">
                {totalMeals > 0 ? Math.round((weeklyHealthy / totalMeals) * 100) : 0}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Healthy Rate</p>
            </div>
          </div>
        </section>

        {/* ---- TODAY'S FOOD LOG (full width) ---- */}
        <section className="lg:col-span-12 glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-slate-200">Today's Meals</h3>
            <span className="text-[12px] font-semibold text-slate-500">{todayFoodEntries.length} entries</span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[60px] rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
              ))
            ) : todayFoodEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
                  <span className="text-4xl">🍽️</span>
                </div>
                <p className="text-sm font-medium text-slate-400">No meals logged today</p>
                <p className="text-xs text-slate-600 mt-1">Click "Log Meal" to track what you eat</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  + Log Your First Meal
                </button>
              </div>
            ) : (
              todayFoodEntries.map(entry => (
                <div key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/[0.03] ${
                    entry.foodType === 'Junk' ? 'bg-red-500/[0.03] border-red-500/10' : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getMealIcon(entry.mealTime)}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-200">{getMealLabel(entry.mealTime)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{getTimeStr(entry.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      entry.foodType === 'Healthy' ? 'bg-emerald-500/15 text-emerald-400' :
                      entry.foodType === 'Junk' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-cyan-500/15 text-cyan-400'
                    }`}>
                      {getFoodLabel(entry.foodType)}
                    </span>
                    <span className={`text-[12px] font-bold ${entry.healthScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.healthScore >= 0 ? '+' : ''}{entry.healthScore}
                    </span>
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
