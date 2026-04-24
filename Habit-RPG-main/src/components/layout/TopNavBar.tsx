import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore(state => state.user);

  const pageTitle = location.pathname === '/settings' ? 'Settings' : 'Dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-brand-dark/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 lg:px-8 py-3">
        {/* Left: Page title */}
        <div className="flex items-center gap-3">
          <span className="lg:hidden text-[15px] font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            NutriIntel
          </span>
          <h2 className="hidden lg:block text-[15px] font-display font-bold text-slate-100 tracking-tight">
            {pageTitle}
          </h2>
        </div>

        {/* Right: User profile link */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-[16px]">person</span>
          </div>
          <span className="hidden md:block text-[13px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
            {user?.name || 'User'}
          </span>
        </button>
      </div>
    </header>
  );
};
