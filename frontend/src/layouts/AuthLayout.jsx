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
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white mx-auto mb-3"
            style={{ background: "var(--accent)" }}
          >
            DP
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            DuePilot AI
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Navigate Every Deadline
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
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
