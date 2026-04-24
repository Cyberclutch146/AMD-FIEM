import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { LevelCard } from '../components/dashboard/LevelCard';
import { QuestCard } from '../components/dashboard/QuestCard';
import { useHabitStore } from '../store/useHabitStore';
import { useUserStore } from '../store/useUserStore';
import { FAB } from '../components/dashboard/FAB';
import { AddHabitModal } from '../components/dashboard/AddHabitModal';
import { gameEngine } from '../lib/gameEngine';
import { AnimatedText } from '../components/animations/AnimatedText';

export const Dashboard: React.FC = () => {
  const habits = useHabitStore(state => state.habits);
  const loading = useHabitStore(state => state.loading);
  const getTodayCompletedHabits = useHabitStore(state => state.getTodayCompletedHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useUserStore(state => state.user);
  useHabitStore(state => state.logs); // Subscribe to re-render
  
  const completedIds = getTodayCompletedHabits();
  
  // -- HEALTH INTELLIGENCE --
  const lastCheckInMs = user?.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : null;
  const currentSuggestion = gameEngine.generateSuggestions(lastCheckInMs, new Date());
  const logs = useHabitStore(state => state.logs);
  const currentRisk = gameEngine.predictRisk(logs);

  return (
    <div className="flex flex-col flex-1 relative bg-background min-h-screen">
      <TopBar />
      
      <main className="flex-1 pb-32 px-5 pt-2 space-y-8 relative z-0">
        
        {/* -- DECISION HUB: REAL-TIME SUGGESTION -- */}
        <div className="bg-primary-container/20 border border-primary/40 rounded-2xl p-5 shadow-[0_0_20px_rgba(209,54,57,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start gap-3 relative z-10">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <div>
              <h3 className="font-headline font-black text-xs uppercase text-primary tracking-widest mb-1">Health Intelligence</h3>
              <p className="text-on-surface text-sm font-medium">{currentSuggestion}</p>
            </div>
          </div>
        </div>

        <LevelCard />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black font-label tracking-[0.2em] text-primary uppercase drop-shadow-sm">
              <AnimatedText text="Daily Quests" />
            </h2>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Resets at midnight</span>
          </div>
          
          <div className="flex flex-col w-full relative z-10">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container h-40 rounded-2xl mb-4 animate-[pulse_1.5s_infinite] opacity-50 border border-outline-variant/10" />
              ))
            ) : (
              habits.length === 0 ? (
                <div className="text-center p-8 bg-surface-container-high border border-outline-variant/30 rounded-2xl text-on-surface-variant text-sm italic font-medium">
                  No quests active. Tap + to begin your journey.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {habits.filter(h => !completedIds.includes(h.id)).map(habit => (
                      <QuestCard 
                        key={habit.id} 
                        habit={habit} 
                        completed={false} 
                      />
                    ))}
                    {habits.filter(h => !completedIds.includes(h.id)).length === 0 && (
                      <div className="text-center p-6 bg-surface-container border border-outline-variant/20 rounded-2xl text-on-surface-variant font-medium text-xs uppercase tracking-widest">
                        All Quests Completed!
                      </div>
                    )}
                  </div>

                  {habits.filter(h => completedIds.includes(h.id)).length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-2">Completed Quests</h3>
                      {habits.filter(h => completedIds.includes(h.id)).map(habit => (
                        <QuestCard 
                          key={habit.id} 
                          habit={habit} 
                          completed={true} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 pb-12">
          {/* Dynamic Health Stats */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Health Score</span>
            <span className="text-lg font-black italic text-primary drop-shadow-sm uppercase">{user?.healthScore || 0}</span>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Risk Status</span>
            <span className="text-xs font-black italic text-amber-500 drop-shadow-sm">{currentRisk.split(':')[0]}</span>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Current Streak</span>
            <span className="text-lg font-black italic text-on-surface drop-shadow-sm">{user?.streak || 0}</span>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-95 cursor-default">
            <span className="text-[10px] font-bold font-label text-on-surface-variant uppercase tracking-widest mb-1">Consistency</span>
            <span className="text-lg font-black italic text-on-surface drop-shadow-sm">{user?.consistencyScore || 0}</span>
          </div>
        </section>
      </main>

      <FAB onClick={() => setIsModalOpen(true)} />
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <BottomNav />
    </div>
  );
};
