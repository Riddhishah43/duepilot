import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register, demoLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        await register(form.name, form.email, form.password);
        toast.success("Account created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await demoLogin();
      toast.success("Welcome to DuePilot AI!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Demo account unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tab-glass mb-6">
        {["login", "register"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-glass-item${tab === t ? " active" : ""}`}
          >
            {t === "login" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "register" && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Name
            </label>
            <input
              type="text"
              className="input-glass"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Email
          </label>
          <input
            type="email"
            className="input-glass"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Password
          </label>
          <input
            type="password"
            className="input-glass"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-glass py-3 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Processing...
            </span>
          ) : (
            tab === "login" ? "Sign In" : "Create Account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div style={{ width: "100%", borderTop: "1px solid var(--glass-border)" }} />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs font-medium" style={{ color: "var(--text-muted)", background: "var(--bg-glass-heavy)", backdropFilter: "blur(30px)", borderRadius: "var(--radius-pill)" }}>
            or
          </span>
        </div>
      </div>

      {/* Demo */}
      <button
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full btn-glass-secondary py-3 disabled:opacity-60"
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-[var(--accent-2)] border-t-transparent animate-spin" />
        ) : (
          "🚀 Try Demo Account"
        )}
      </button>
    </div>
  );
}
