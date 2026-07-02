import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/goals", label: "Goals", icon: "🎯" },
  { to: "/targets", label: "Targets", icon: "🎯" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/ai-coach", label: "AI Coach", icon: "🤖" },
  { to: "/focus", label: "Focus", icon: "⏱️" },
  { to: "/rescue", label: "Rescue", icon: "🚨" },
  { to: "/notifications", label: "Smart Alerts", icon: "🔔" },
  { to: "/insights", label: "Insights", icon: "🧠" },
  { to: "/study-planner", label: "Study Planner", icon: "📚" },
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
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--bg-glass-heavy)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid var(--glass-border)",
        }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              DP
            </div>
            <div>
              <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>DuePilot</h2>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>AI Productivity</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `glass-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "var(--accent-gradient)" }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {user?.name || "User"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="flex-1 text-xs font-medium px-2 py-1.5 rounded-xl transition-all"
              style={{
                color: "var(--text-secondary)",
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)",
              }}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 text-xs font-medium px-2 py-1.5 rounded-xl transition-all"
              style={{
                color: "#FCA5A5",
                background: "rgba(239,68,68,0.1)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 border-b border-[var(--glass-border)]"
          style={{
            background: "var(--bg-glass-heavy)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
        >
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl transition-all"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={toggleTheme}
                className="btn-ghost-glass text-sm"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => navigate("/focus")}
                className="btn-ghost-glass text-sm flex items-center gap-1"
              >
                <span>⏱️</span>
                <span className="hidden sm:inline">Focus</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
