import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';
import { useAuthStore } from './store/useAuthStore';
import { useUserStore } from './store/useUserStore';
import { useHabitStore } from './store/useHabitStore';

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("App error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-6 bg-brand-dark">
          <div className="max-w-md p-8 rounded-2xl glass-card text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl block mb-4">error</span>
            <h1 className="text-xl font-display font-bold text-red-400 mb-2">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-4">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading spinner shown while auth state is being determined
const AuthLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-brand-dark">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 mb-4 animate-pulse">
        <span className="material-symbols-outlined text-emerald-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
      </div>
      <p className="text-sm text-slate-500 font-medium">Loading NutriIntel...</p>
    </div>
  </div>
);

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex h-screen w-full bg-brand-dark overflow-hidden">
    <SideNavBar />
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopNavBar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  </div>
);

// Main authenticated app content
function AuthenticatedApp() {
  const firebaseUser = useAuthStore(state => state.firebaseUser);
  const initUser = useUserStore(state => state.initUser);
  const initDataSync = useHabitStore(state => state.initDataSync);

  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    // Also store display name/email from Google in the user doc
    const unsubUser = initUser(uid);
    const unsubData = initDataSync(uid);

    return () => { unsubUser(); unsubData(); };
  }, [firebaseUser, initUser, initDataSync]);

  // Sync Google profile name on first login
  useEffect(() => {
    if (!firebaseUser) return;
    const user = useUserStore.getState().user;
    if (user && !user.name && firebaseUser.displayName) {
      useUserStore.getState().updateName(firebaseUser.displayName);
      // Also save to Firestore
      import('./lib/db').then(({ UsersDB }) => {
        UsersDB.update(firebaseUser.uid, {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
        }).catch(console.error);
      });
    }
  }, [firebaseUser]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const firebaseUser = useAuthStore(state => state.firebaseUser);
  const authLoading = useAuthStore(state => state.loading);
  const authInitialized = useAuthStore(state => state.initialized);

  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, [initAuth]);

  // Still loading auth state
  if (!authInitialized || authLoading) return <AuthLoading />;

  return (
    <ErrorBoundary>
      <Router>
        {firebaseUser ? (
          <AuthenticatedApp />
        ) : (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        )}
      </Router>
    </ErrorBoundary>
  );
}

export default App;
