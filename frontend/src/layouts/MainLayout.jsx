import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  CheckCircle,
  Target,
  TrendingUp,
  Bot,
  Timer,
  BellRing,
  Bell,
  BrainCircuit,
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckCircle },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/targets", label: "Targets", icon: Target },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/ai-coach", label: "AI Coach", icon: Bot },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/rescue", label: "Rescue", icon: BellRing },
  { to: "/notifications", label: "Smart Alerts", icon: Bell },
  { to: "/insights", label: "Insights", icon: BrainCircuit },
  { to: "/study-planner", label: "Study Planner", icon: BookOpen },
];

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--bg-tertiary)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: "var(--accent)" }}
          >
            DP
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>DuePilot</h2>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "var(--accent)" }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {user?.name || "User"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-ghost flex-1 text-xs"
            >
              <User size={14} />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-ghost flex-1 text-xs"
              style={{ color: "var(--danger)" }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 h-14 border-b flex items-center px-4 lg:px-6 gap-3"
          style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => navigate("/focus")}
              className="btn btn-ghost btn-sm hidden sm:flex items-center gap-1"
            >
              <Timer size={16} />
              Focus
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
