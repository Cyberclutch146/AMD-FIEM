import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/food-log', icon: 'restaurant', label: 'Food Log' },
  { to: '/patterns', icon: 'insights', label: 'Health Patterns' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export const SideNavBar: React.FC = () => {
  const user = useUserStore(state => state.user);

  return (
    <nav className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 left-0 bg-brand-darker/80 backdrop-blur-2xl border-r border-white/[0.06] py-8 z-40 shrink-0">
      {/* Logo */}
      <div className="px-7 mb-10">
        <h1 className="text-[22px] font-display font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          NutriIntel
        </h1>
        <p className="text-[11px] font-medium text-emerald-500/80 tracking-[0.15em] uppercase mt-0.5">
          Health Intelligence
        </p>
      </div>

      {/* Nav Items */}
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

      {/* User */}
      <div className="px-6 mt-auto pt-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">person</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-200 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-emerald-500/60 font-medium tracking-wider uppercase">Online</p>
          </div>
        </div>
      </div>
    </nav>
  );
};
