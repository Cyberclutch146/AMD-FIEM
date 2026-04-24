import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { UsersDB } from '../lib/db';

export const Settings: React.FC = () => {
  const user = useUserStore(state => state.user);
  const updateName = useUserStore(state => state.updateName);
  const firebaseUser = useAuthStore(state => state.firebaseUser);
  const logout = useAuthStore(state => state.logout);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  if (!user) return null;

  const displayName = user.name || firebaseUser?.displayName || 'User';

  const saveName = async () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== displayName) {
      updateName(trimmed);
      try {
        await UsersDB.update(user.id, { name: trimmed });
      } catch (e) {
        console.error(e);
      }
    }
    setEditingName(false);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "nutriintel_export.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <main className="p-6 lg:p-10 max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <section className="glass-card p-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">Your Profile</h3>

        <div className="flex items-center gap-5 relative z-10">
          {firebaseUser?.photoURL ? (
            <img src={firebaseUser.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">person</span>
            </div>
          )}
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  placeholder="Enter your name..."
                  className="bg-white/[0.06] text-white px-4 py-2.5 rounded-xl outline-none border border-emerald-500/30 text-lg font-display font-bold flex-1 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button
                  onClick={saveName}
                  className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
            ) : (
              <div>
                <h2
                  onClick={() => { setEditingName(true); setNewName(displayName); }}
                  className="text-xl font-display font-bold text-white cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                  {displayName}
                  <span className="material-symbols-outlined text-[14px] text-slate-600 group-hover:text-emerald-400 transition-colors">edit</span>
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{firebaseUser?.email || 'Click to edit your display name'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/[0.06]">
          <div className="text-center">
            <p className="text-3xl font-display font-extrabold text-emerald-400">{user.healthScore || 0}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Health Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-extrabold text-cyan-400">{user.streak || 0}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-extrabold text-purple-400">{user.consistencyScore || 0}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Consistency</p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data & Account</h3>

        <button onClick={handleExport}
          className="w-full glass-card p-5 flex items-center justify-between hover:bg-white/[0.04] transition-colors text-left group"
        >
          <div>
            <p className="text-sm font-semibold text-emerald-400">Export JSON Data</p>
            <p className="text-xs text-slate-500 mt-0.5">Download a copy of your progress</p>
          </div>
          <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-0.5 transition-transform">download</span>
        </button>

        <button onClick={logout}
          className="w-full glass-card p-5 flex items-center justify-between hover:bg-red-500/[0.06] transition-colors text-left group border-red-500/0 hover:border-red-500/10"
        >
          <div>
            <p className="text-sm font-semibold text-red-400">Sign Out</p>
            <p className="text-xs text-slate-500 mt-0.5">Sign out of your Google account</p>
          </div>
          <span className="material-symbols-outlined text-red-400 group-hover:translate-x-0.5 transition-transform">logout</span>
        </button>
      </section>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-white/[0.04]">
        <p className="text-xs text-slate-600">NutriIntel — Smart Food Decision System</p>
        <p className="text-[10px] text-slate-700 mt-1">All data is stored securely in the cloud</p>
      </div>
    </main>
  );
};
