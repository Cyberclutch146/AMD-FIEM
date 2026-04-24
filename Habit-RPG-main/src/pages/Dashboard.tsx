import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { useUserStore } from '../store/useUserStore';
import { AddHabitModal } from '../components/dashboard/AddHabitModal';
import { gameEngine } from '../lib/gameEngine';

export const Dashboard: React.FC = () => {
  const habits = useHabitStore(state => state.habits);
  const loading = useHabitStore(state => state.loading);
  const logs = useHabitStore(state => state.logs);
  const getTodayCompletedHabits = useHabitStore(state => state.getTodayCompletedHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useUserStore(state => state.user);

  getTodayCompletedHabits(); // trigger subscription

  // Health Intelligence
  const healthScore = user?.healthScore || 0;

  const streak = user?.streak || 0;
  const lastCheckInMs = user?.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : null;
  const currentSuggestion = gameEngine.generateSuggestions(lastCheckInMs, new Date());

  const scorePercent = Math.min(100, healthScore);

  // Today's completed food logs for the food log panel
  const todayLogs = logs.filter(log => {
    if (!log.timestamp) return false;
    const logDate = log.timestamp instanceof Date
      ? log.timestamp
      : log.timestamp.toDate
        ? log.timestamp.toDate()
        : new Date(log.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  // Map today's logs to habits for display
  const todayFoodEntries = todayLogs.map(log => {
    const habit = habits.find(h => h.id === log.habitId);
    return {
      id: log.id,
      name: habit?.title || 'Unknown',
      type: habit?.type || 'Custom',
      mealTime: log.mealTime || 'Snack',
      foodType: log.foodType || 'Healthy',
      healthScore: log.healthScoreAwarded || 0,
    };
  });

  const getMealIcon = (mealTime: string) => {
    switch (mealTime) {
      case 'Morning': return 'bakery_dining';
      case 'Afternoon': return 'lunch_dining';
      case 'Night': return 'dinner_dining';
      default: return 'fastfood';
    }
  };

  const getMealLabel = (mealTime: string) => {
    switch (mealTime) {
      case 'Morning': return 'Breakfast';
      case 'Afternoon': return 'Lunch';
      case 'Night': return 'Dinner';
      default: return 'Snack';
    }
  };

  const getTagStyle = (foodType: string) => {
    switch (foodType) {
      case 'Healthy':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Junk':
        return 'bg-[#f59e0b]/20 text-[#f59e0b]';
      case 'Water':
        return 'bg-cyan-500/20 text-cyan-400';
      default:
        return 'bg-white/10 text-slate-300';
    }
  };

  const getTagLabel = (foodType: string) => {
    switch (foodType) {
      case 'Healthy': return 'Healthy';
      case 'Junk': return 'Processed';
      case 'Water': return 'Hydration';
      default: return 'Custom';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <main className="flex-1 p-gutter md:p-margin lg:p-xl space-y-gutter">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-lg">
        <div>
          <h2 className="font-display-lg text-headline-lg text-on-surface">Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Smart Food Decision System — {currentDate}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-full font-label-md text-label-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.97]"
        >
          <span className="material-symbols-outlined">add</span>
          Log Meal
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

        {/* ===== HERO SCORE CARD (4 cols) ===== */}
        <section className="col-span-1 md:col-span-4 glass-panel rounded-xl p-lg flex flex-col items-center justify-center aurora-glow">
          <h3 className="font-headline-md text-headline-md w-full text-left mb-xl">Health Score</h3>
          <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
            <svg className="circular-chart w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4edea3" />
                  <stop offset="100%" stopColor="#00a2e6" />
                </linearGradient>
              </defs>
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle circle-gradient"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeDasharray={`${scorePercent}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-stats-xl text-stats-xl text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                {healthScore}
              </span>
              <span className="font-label-md text-label-md text-slate-400 mt-1">/100</span>
            </div>
          </div>
          <div className="mt-xl w-full bg-surface-container-lowest/50 rounded-lg p-4 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">local_fire_department</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-slate-300">Consistency Streak</p>
                <p className="font-headline-md text-body-lg text-primary">{streak} Days</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 30-DAY TRAJECTORY (8 cols) ===== */}
        <section className="col-span-1 md:col-span-8 glass-panel rounded-xl p-lg flex flex-col">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <h3 className="font-headline-md text-headline-md">30-Day Trajectory</h3>
              <p className="font-body-md text-body-md text-slate-400 mt-1">Metabolic response vs. baseline</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-white/10 text-white font-label-md text-xs">W</button>
              <button className="px-3 py-1 rounded bg-primary/20 text-primary font-label-md text-xs border border-primary/30">M</button>
              <button className="px-3 py-1 rounded bg-white/5 text-slate-400 font-label-md text-xs hover:bg-white/10 transition-colors">Y</button>
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-[200px] mt-md bg-gradient-to-t from-primary/10 to-transparent rounded-lg border-b border-primary/30 overflow-hidden flex items-end">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4edea3" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q20,70 40,85 T80,40 T100,20 L100,100 L0,100 Z" fill="url(#chartGradient)" opacity="0.3" />
              <path d="M0,80 Q20,70 40,85 T80,40 T100,20" fill="none" stroke="#4edea3" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </section>

        {/* ===== PROACTIVE INSIGHTS (6 cols) ===== */}
        <section className="col-span-1 md:col-span-6 glass-panel rounded-xl p-lg border-l-4 border-l-tertiary-container relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[100px]">auto_awesome</span>
          </div>
          <div className="flex items-center gap-3 mb-md">
            <div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary-container text-sm">lightbulb</span>
            </div>
            <h3 className="font-headline-md text-body-lg text-tertiary-container">Proactive Insights</h3>
          </div>
          <p className="font-body-lg text-body-lg text-slate-200 leading-relaxed relative z-10">
            {currentSuggestion}
          </p>
          <div className="mt-md flex gap-3 relative z-10">
            <button className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded font-label-md text-sm border border-white/5">
              View Details
            </button>
            <button className="bg-tertiary-container/20 hover:bg-tertiary-container/30 text-tertiary transition-colors px-4 py-2 rounded font-label-md text-sm border border-tertiary-container/30">
              Set Reminder
            </button>
          </div>
        </section>

        {/* ===== TODAY'S FOOD LOG (6 cols) ===== */}
        <section className="col-span-1 md:col-span-6 glass-panel rounded-xl p-lg">
          <div className="flex justify-between items-center mb-md pb-md border-b border-white/10">
            <h3 className="font-headline-md text-body-lg">Today's Food Log</h3>
            <a className="text-primary font-label-md text-sm hover:underline cursor-pointer">View All</a>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
              ))
            ) : todayFoodEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">restaurant</span>
                <p className="font-label-md text-sm">No meals logged today.</p>
                <p className="text-xs text-slate-500 mt-1">Click "Log Meal" to get started.</p>
              </div>
            ) : (
              todayFoodEntries.map(entry => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-white/5 border hover:bg-white/10 transition-colors ${
                    entry.foodType === 'Junk' ? 'border-red-500/20' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">{getMealIcon(entry.mealTime)}</span>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface">{getMealLabel(entry.mealTime)}</p>
                      <p className="font-body-md text-sm text-slate-400">{entry.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-label-md uppercase tracking-wider ${getTagStyle(entry.foodType)}`}>
                      {getTagLabel(entry.foodType)}
                    </span>
                    <span className="font-label-md text-slate-300 text-sm">+{entry.healthScore}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Log Meal Modal */}
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
};
