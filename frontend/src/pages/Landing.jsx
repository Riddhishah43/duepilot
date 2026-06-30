import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="px-6 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-sm">DP</div>
          <span className="font-semibold text-sm">DuePilot AI</span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">Log In</Link>
          <Link to="/auth?tab=register" className="text-sm bg-primary text-white px-3 py-1.5 rounded hover:bg-[#2a4560] transition-colors">Get Started</Link>
        </div>
      </header>

      <section className="px-6 pt-16 pb-24 max-w-3xl mx-auto text-center">
        <span className="inline-block px-3 py-1 rounded bg-priority-high/30 text-primary text-xs font-medium mb-4">
          AI-Powered Productivity
        </span>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Never Miss a <span className="text-gradient">Deadline Again</span>
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto mb-8">
          An AI assistant that helps you finish tasks — not just remember them. Predicts risks, breaks down work, and optimizes your schedule.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth?tab=register" className="bg-primary text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-[#2a4560] transition-colors">Start Free</Link>
          <Link to="/auth" className="border border-gray-300 px-6 py-2.5 rounded font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors">Sign In</Link>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "AI Task Breakdown", desc: "Large tasks automatically split into actionable subtasks with estimated durations." },
            { title: "Risk Prediction", desc: "AI predicts which deadlines you'll miss before they happen and alerts you." },
            { title: "Smart Scheduling", desc: "Automatically optimizes your daily schedule based on priorities and free time." },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
