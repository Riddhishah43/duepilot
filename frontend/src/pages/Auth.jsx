import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register } = useAuth();

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

  return (
    <div>
      <div className="flex bg-bg-elevated rounded-md p-0.5 mb-5">
        {["login", "register"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
              tab === t ? "bg-bg-surface text-primary border border-default/50" : "text-text-muted"
            }`}
          >
            {t === "login" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {tab === "register" && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Name</label>
            <input type="text" className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
        )}
        <div>
          <label className="block text-sm text-text-muted mb-1">Email</label>
          <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Password</label>
          <input type="password" className="input-field" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
          {tab === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
