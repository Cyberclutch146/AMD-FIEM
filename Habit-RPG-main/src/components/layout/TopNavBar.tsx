import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

export const TopNavBar: React.FC = () => {
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-8 py-4 font-headline-lg uppercase tracking-wider text-xs font-semibold">
      {/* Left: Title */}
      <div className="flex items-center gap-6 w-1/3">
        <span className="hidden md:block text-lg font-black text-white capitalize normal-case tracking-normal">
          Health Intelligence Terminal
        </span>
        {/* Mobile branding */}
        <span className="md:hidden text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          NutriIntel
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex items-center justify-center w-1/3">
        <div className="relative w-full max-w-md focus-within:ring-1 focus-within:ring-emerald-500/50 rounded-full transition-shadow">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full bg-surface-container-high/50 border border-white/10 rounded-full py-2 pl-12 pr-4 text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-primary-container font-label-md normal-case tracking-normal text-sm"
            placeholder="Search patterns, logs, insights..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-2 w-1/3 text-emerald-500">
        <button className="p-2 hover:text-emerald-200 transition-colors rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 hover:text-emerald-200 transition-colors rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">analytics</span>
        </button>
        <button
          className="p-2 hover:text-emerald-200 transition-colors rounded-full hover:bg-white/5"
          onClick={() => navigate('/settings')}
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
};
