import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: "#fff", color: "#333", border: "1px solid #e5e7eb", borderRadius: "8px" }, duration: 4000 }} />
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
  );
}

export default App;
