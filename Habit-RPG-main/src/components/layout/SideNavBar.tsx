import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export const SideNavBar: React.FC = () => {
  const firebaseUser = useAuthStore(state => state.firebaseUser);
  const logout = useAuthStore(state => state.logout);

  return (
    <nav className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 left-0 bg-brand-darker/80 backdrop-blur-2xl border-r border-white/[0.06] py-8 z-40 shrink-0">
      <div className="px-7 mb-10">
        <h1 className="text-[22px] font-display font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          NutriIntel
        </h1>
        <p className="text-[11px] font-medium text-emerald-500/80 tracking-[0.15em] uppercase mt-0.5">
          Health Intelligence
        </p>
      </div>

      <ul className="flex flex-col gap-1 px-4 flex-1">
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/[0.12] text-emerald-400 shadow-inner border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[20px] ${isActive ? 'text-emerald-400' : ''}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="px-5 mt-auto pt-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          {firebaseUser?.photoURL ? (
            <img src={firebaseUser.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">person</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 leading-tight truncate">
              {firebaseUser?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {firebaseUser?.email || ''}
            </p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-400 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/[0.08] border border-white/[0.06] hover:border-red-500/20 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign Out
        </button>
      </div>
    </nav>
  );
};
