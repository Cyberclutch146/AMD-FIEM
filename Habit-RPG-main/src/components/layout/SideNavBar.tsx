import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', fill: true },
  { to: '/food-log', icon: 'restaurant', label: 'Food Log', fill: false },
  { to: '/patterns', icon: 'insights', label: 'Health Patterns', fill: false },
  { to: '/settings', icon: 'settings', label: 'Settings', fill: false },
];

export const SideNavBar: React.FC = () => {
  const user = useUserStore(state => state.user);

  return (
    <nav className="hidden md:flex flex-col h-screen sticky top-0 left-0 w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-2xl py-8 font-headline-lg antialiased z-40 shrink-0">
      {/* Branding */}
      <div className="px-8 mb-12">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          NutriIntel
        </h1>
        <p className="text-emerald-500 font-label-md text-label-md mt-1">Health Intelligence</p>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col gap-2 px-4 flex-1">
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 active:scale-[0.98] font-label-md text-label-md ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10 border-r-2 border-emerald-500'
                    : 'text-slate-400 hover:bg-white/5 hover:text-emerald-300'
                }`
              }
            >
              <span
                className="material-symbols-outlined"
                style={item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User Profile Footer */}
      <div className="px-8 mt-auto flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-white/10 bg-surface-container-highest flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-slate-400">person</span>
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface">{user?.name || 'User'}</p>
          <p className="font-label-md text-slate-500 text-[10px] uppercase tracking-wider">Active</p>
        </div>
      </div>
    </nav>
  );
};
