import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            DP
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>DuePilot</span>
        </div>
        <div className="flex gap-2">
          <Link
            to="/auth"
            className="btn-ghost-glass text-sm px-4 py-2"
          >
            Log In
          </Link>
          <Link
            to="/auth?tab=register"
            className="btn-glass text-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            color: "var(--accent-2)",
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent-1)" }} />
          AI-Powered Productivity
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5 tracking-tight" style={{ color: "var(--text-primary)" }}>
          Never Miss a{" "}
          <span className="text-gradient">Deadline Again</span>
        </h1>

        <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
          An AI assistant that helps you finish tasks — not just remember them.
          Predicts risks, breaks down work, and optimizes your schedule.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth?tab=register" className="btn-glass px-8 py-3 text-base">
            Start Free
          </Link>
          <Link to="/auth" className="btn-glass-secondary px-8 py-3 text-base">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              emoji: "🧠",
              title: "AI Task Breakdown",
              desc: "Large tasks automatically split into actionable subtasks with estimated durations and priority ordering."
            },
            {
              emoji: "🎯",
              title: "Risk Prediction",
              desc: "AI predicts which deadlines you'll miss before they happen and alerts you with actionable recommendations."
            },
            {
              emoji: "📋",
              title: "Smart Scheduling",
              desc: "Automatically optimizes your daily schedule based on priorities, deadlines, and available time slots."
            },
            {
              emoji: "🚨",
              title: "Rescue Mode",
              desc: "Emergency intervention that builds a complete survival plan when multiple deadlines are approaching."
            },
            {
              emoji: "📊",
              title: "Analytics & Insights",
              desc: "Beautiful charts showing your productivity trends, completion rates, and behavioral patterns."
            },
            {
              emoji: "⏱️",
              title: "Focus Mode",
              desc: "Built-in Pomodoro timer with configurable focus/break cycles to help you stay in the zone."
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-card p-6"
            >
              <span className="text-2xl mb-3 block">{f.emoji}</span>
              <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t" style={{ borderColor: "var(--glass-border)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Built with ❤️ by DuePilot AI
        </p>
      </footer>
    </div>
  );
}
