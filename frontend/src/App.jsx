import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TaskManager from "./pages/TaskManager";
import StudyPlanner from "./pages/StudyPlanner";
import PatternInsights from "./pages/PatternInsights";
import SmartNotifications from "./pages/SmartNotifications";
import Goals from "./pages/Goals";
import Targets from "./pages/Targets";
import Analytics from "./pages/Analytics";
import AICoach from "./pages/AICoach";
import FocusMode from "./pages/FocusMode";
import RescueMode from "./pages/RescueMode";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/common/ErrorBoundary";

function WakeUpScreen() {
  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col items-center justify-center text-center px-4">
      <div className="glass-card-static w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 text-gradient glow-accent">
        DP
      </div>
      <h1 className="text-xl font-bold text-[#F1F5F9] mb-3">Waking up DuePilot server...</h1>
      <p className="text-sm text-[#64748B] max-w-sm mb-6">
        The server was asleep. This usually takes a few seconds.
      </p>
      <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#5B8CFF] animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, wakingUp } = useAuth();
  if (wakingUp) return <WakeUpScreen />;
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#07111F]">
      <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#5B8CFF] animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <div className="page-enter">{children}</div>;
}

function PublicRoute({ children }) {
  const { user, loading, wakingUp } = useAuth();
  if (wakingUp) return <WakeUpScreen />;
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#07111F]">
      <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#5B8CFF] animate-spin" />
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return <div className="page-enter">{children}</div>;
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15,23,42,0.8)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            color: "#F1F5F9",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          },
          duration: 4000,
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<PublicRoute><AuthLayout><Auth /></AuthLayout></PublicRoute>} />
        <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/tasks" element={<ErrorBoundary><ProtectedRoute><MainLayout><TaskManager /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/goals" element={<ErrorBoundary><ProtectedRoute><MainLayout><Goals /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/targets" element={<ErrorBoundary><ProtectedRoute><MainLayout><Targets /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/analytics" element={<ErrorBoundary><ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/ai-coach" element={<ErrorBoundary><ProtectedRoute><MainLayout><AICoach /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/focus" element={<ErrorBoundary><ProtectedRoute><MainLayout><FocusMode /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/rescue" element={<ErrorBoundary><ProtectedRoute><MainLayout><RescueMode /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/study-planner" element={<ErrorBoundary><ProtectedRoute><MainLayout><StudyPlanner /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/insights" element={<ErrorBoundary><ProtectedRoute><MainLayout><PatternInsights /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/notifications" element={<ErrorBoundary><ProtectedRoute><MainLayout><SmartNotifications /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/profile" element={<ErrorBoundary><ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="/settings" element={<ErrorBoundary><ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute></ErrorBoundary>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
