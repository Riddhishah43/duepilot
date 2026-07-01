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

import Targets from "./pages/Targets";
import Analytics from "./pages/Analytics";
import AICoach from "./pages/AICoach";
import FocusMode from "./pages/FocusMode";
import RescueMode from "./pages/RescueMode";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function WakeUpScreen() {
  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded bg-primary flex items-center justify-center text-white font-bold text-lg mb-4 animate-pulse">DP</div>
      <h1 className="text-lg font-semibold text-primary mb-2">Waking up DuePilot server...</h1>
      <p className="text-sm text-text-muted max-w-xs">The server was asleep. This usually takes a few seconds.</p>
      <div className="mt-6 animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, wakingUp } = useAuth();
  if (wakingUp) return <WakeUpScreen />;
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-bg-deep"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading, wakingUp } = useAuth();
  if (wakingUp) return <WakeUpScreen />;
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-bg-deep"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: "#2A3242", color: "#F8FAFC", border: "1px solid #475569", borderRadius: "18px" }, duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<PublicRoute><AuthLayout><Auth /></AuthLayout></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><MainLayout><TaskManager /></MainLayout></ProtectedRoute>} />

        <Route path="/targets" element={<ProtectedRoute><MainLayout><Targets /></MainLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><MainLayout><AICoach /></MainLayout></ProtectedRoute>} />
        <Route path="/focus" element={<ProtectedRoute><MainLayout><FocusMode /></MainLayout></ProtectedRoute>} />
        <Route path="/rescue" element={<ProtectedRoute><MainLayout><RescueMode /></MainLayout></ProtectedRoute>} />
        <Route path="/study-planner" element={<ProtectedRoute><MainLayout><StudyPlanner /></MainLayout></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><MainLayout><PatternInsights /></MainLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><MainLayout><SmartNotifications /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
