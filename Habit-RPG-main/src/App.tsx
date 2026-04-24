import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Boss } from './pages/Boss';
import { Login } from './pages/Login';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';
import { JuiceOverlay } from './components/JuiceOverlay';
import { useAuthStore } from './store/useAuthStore';
import { useUserStore } from './store/useUserStore';
import { useHabitStore } from './store/useHabitStore';
import { LoadingScreen } from './components/LoadingScreen';

// Global Error Boundary to catch Firebase async crashes and React errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught app error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-6 bg-background text-center">
          <div className="max-w-md p-8 rounded-xl glass-panel">
            <span className="material-symbols-outlined text-red-400 text-6xl mb-4">warning</span>
            <h1 className="text-2xl font-bold text-red-400 mb-2 tracking-tight font-headline-lg">System Failure</h1>
            <p className="text-on-surface-variant font-body-md mb-6 text-sm">
              The application encountered an unexpected error. Please restart your session.
            </p>
            <div className="text-xs bg-surface-container text-on-surface p-4 rounded text-left overflow-auto max-h-32 mb-6 border border-white/10">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-container text-white hover:bg-emerald-600 transition-colors rounded-full font-bold font-label-md tracking-widest uppercase text-sm"
            >
              Restart
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Wrapper
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const fbUser = useAuthStore(state => state.fbUser);
  if (!fbUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Authenticated Layout with SideNav + TopNav
const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <SideNavBar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden overflow-y-auto">
        <TopNavBar />
        <JuiceOverlay />
        {children}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const initAuthListener = useAuthStore(state => state.initAuthListener);
  const fbUser = useAuthStore(state => state.fbUser);
  const initialized = useAuthStore(state => state.initialized);
  const initUserListener = useUserStore(state => state.initUserListener);

  const initDataSync = useHabitStore(state => state.initDataSync);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  // Keep dark mode always on for NutriIntel
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (fbUser) {
      const unsubUser = initUserListener();
      const unsubData = initDataSync(fbUser.uid);
      return () => {
        unsubUser();
        unsubData();
      }
    }
  }, [initUserListener, initDataSync, fbUser]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={!fbUser ? <Login /> : <Navigate to="/dashboard" replace />} />
          
          <Route path="/" element={<AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>} />
          <Route path="/dashboard" element={<AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>} />
          <Route path="/food-log" element={<AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>} />
          <Route path="/patterns" element={<AuthGuard><AppLayout><Stats /></AppLayout></AuthGuard>} />
          <Route path="/boss" element={<AuthGuard><AppLayout><Boss /></AppLayout></AuthGuard>} />
          <Route path="/stats" element={<AuthGuard><AppLayout><Stats /></AppLayout></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><AppLayout><Settings /></AppLayout></AuthGuard>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
