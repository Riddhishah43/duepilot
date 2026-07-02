export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-4"
            style={{ background: "var(--accent-gradient)", boxShadow: "0 4px 24px var(--accent-glow)" }}
          >
            DP
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            DuePilot AI
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Navigate Every Deadline
          </p>
        </div>

        {/* Glass card */}
        <div
          className="glass-card-static p-7"
        >
          {children}
        </div>

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
          Built with AI to help you finish what matters
        </p>
      </div>
    </div>
  );
}
