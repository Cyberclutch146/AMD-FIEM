import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-brand-dark/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-3.5">
        {/* Left: Page title */}
        <div className="flex items-center gap-4">
          <h2 className="hidden md:block text-[15px] font-display font-bold text-slate-100 tracking-tight">
            Health Intelligence Terminal
          </h2>
          <span className="lg:hidden text-[15px] font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            NutriIntel
          </span>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px] group-focus-within:text-emerald-400 transition-colors">
              search
            </span>
            <input
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20 transition-all"
              placeholder="Search patterns, logs, insights..."
              type="text"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-all">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-all">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
