export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white mx-auto mb-3 bg-accent">
            DP
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            DuePilot AI
          </h1>
          <p className="text-sm mt-1 text-text-secondary">
            Navigate Every Deadline
          </p>
        </div>

        <div className="card p-6">
          {children}
        </div>

        <p className="text-xs text-center mt-6 text-text-muted">
          Built with AI to help you finish what matters
        </p>
      </div>
    </div>
  );
}
