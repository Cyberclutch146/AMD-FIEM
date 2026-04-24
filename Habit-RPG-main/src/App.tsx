import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';
import { useUserStore } from './store/useUserStore';
import { useHabitStore } from './store/useHabitStore';

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("App error:", error, errorInfo); }
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

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex h-screen w-full bg-brand-dark overflow-hidden">
    <SideNavBar />
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopNavBar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  </div>
);

function App() {
  const initUser = useUserStore(state => state.initUser);
  const userId = useUserStore(state => state.userId);
  const initDataSync = useHabitStore(state => state.initDataSync);

  useEffect(() => {
    const unsubUser = initUser();
    const unsubData = initDataSync(userId);
    return () => { unsubUser(); unsubData(); };
  }, [initUser, initDataSync, userId]);

  return (
    <ErrorBoundary>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/food-log" element={<Dashboard />} />
            <Route path="/patterns" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
