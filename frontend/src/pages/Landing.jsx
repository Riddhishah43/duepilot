import { Link } from "react-router-dom";
import { BrainCircuit, Target, ClipboardList, BellRing, BarChart3, Timer, ArrowRight, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Task Breakdown",
    desc: "Large tasks automatically split into actionable subtasks with estimated durations and priority ordering."
  },
  {
    icon: Target,
    title: "Risk Prediction",
    desc: "AI predicts which deadlines you'll miss before they happen and alerts you with actionable recommendations."
  },
  {
    icon: ClipboardList,
    title: "Smart Scheduling",
    desc: "Automatically optimizes your daily schedule based on priorities, deadlines, and available time slots."
  },
  {
    icon: BellRing,
    title: "Rescue Mode",
    desc: "Emergency intervention that builds a complete survival plan when multiple deadlines are approaching."
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Detailed productivity trends, completion rates, and behavioral patterns to help you improve."
  },
  {
    icon: Timer,
    title: "Focus Mode",
    desc: "Built-in Pomodoro timer with configurable focus/break cycles to help you stay in the zone."
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="DuePilot Home">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-accent">
              DP
            </div>
            <span className="font-semibold text-base text-text-primary">DuePilot</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="btn btn-ghost text-sm">
              Sign In
            </Link>
            <Link to="/auth?tab=register" className="btn btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 pt-24 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-8 bg-accent-light text-accent border border-accent/20">
          <Zap size={12} />
          AI-Powered Productivity
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight text-text-primary">
          Never Miss a{" "}
          <span className="text-accent">Deadline Again</span>
        </h1>

        <p className="text-base max-w-2xl mx-auto mb-8 text-text-secondary leading-relaxed">
          An AI assistant that helps you finish tasks — not just remember them.
          Predicts risks, breaks down work, and optimizes your schedule.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth?tab=register" className="btn btn-primary h-11 px-6 text-sm">
            Start Free
            <ArrowRight size={16} />
          </Link>
          <Link to="/auth" className="btn btn-secondary h-11 px-6 text-sm">
            Sign In
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Shield size={14} />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={14} />
            AI-powered
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 size={14} />
            Free demo available
          </span>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-lg font-semibold text-text-primary">Everything you need to stay on track</h2>
          <p className="text-sm text-text-secondary mt-1">AI-powered features that adapt to your workflow</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-accent-light text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white bg-accent">DP</div>
            <span className="text-xs text-text-muted">DuePilot AI</span>
          </div>
          <p className="text-xs text-text-muted">
            Built to help you finish what matters
          </p>
        </div>
      </footer>
    </div>
  );
}
