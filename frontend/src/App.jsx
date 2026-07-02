import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";

const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TaskManager = lazy(() => import("./pages/TaskManager"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const PatternInsights = lazy(() => import("./pages/PatternInsights"));
const SmartNotifications = lazy(() => import("./pages/SmartNotifications"));
const Goals = lazy(() => import("./pages/Goals"));
const Targets = lazy(() => import("./pages/Targets"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AICoach = lazy(() => import("./pages/AICoach"));
const FocusMode = lazy(() => import("./pages/FocusMode"));
const RescueMode = lazy(() => import("./pages/RescueMode"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

function WakeUpScreen() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center text-center px-4">
      <div className="card w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 text-accent">
        DP
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-3">Waking up DuePilot server...</h1>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        The server was asleep. This usually takes a few seconds.
      </p>
      <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, wakingUp } = useAuth();
  if (wakingUp) return <WakeUpScreen />;
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <div className="page-enter">{children}</div>;
}

function PublicRoute({ children }) {
  const { user, loading, wakingUp } = useAuth();
  if (wakingUp) return <WakeUpScreen />;
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
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
            background: "rgb(30 41 59)",
            border: "1px solid rgb(51 65 85)",
            borderRadius: "12px",
            color: "#F8FAFC",
            fontSize: "14px",
            padding: "12px 16px",
          },
          duration: 4000,
        }}
      />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-bg-primary">
          <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      }>
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
      </Suspense>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
