import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export default function FocusMode() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [mode, setMode] = useState("pomodoro");
  const intervalRef = useRef(null);

  const durations = { pomodoro: 25 * 60, break: 5 * 60, longBreak: 15 * 60 };

  useEffect(() => { loadTasks(); return () => clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (mode === "pomodoro") {
              const nextSessions = sessions + 1;
              setSessions(nextSessions);
              const nextMode = nextSessions % 4 === 0 ? "longBreak" : "break";
              setMode(nextMode);
              setTimeLeft(durations[nextMode]);
            } else { setMode("pomodoro"); setTimeLeft(durations.pomodoro); }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, sessions]);

  const loadTasks = async () => {
    try { const { data } = await api.get("/tasks", { params: { status: "pending,in-progress" } }); setTasks(data.tasks); }
    catch { console.error("Failed to load tasks"); }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(durations[mode]); };

  const switchMode = (newMode) => { setIsRunning(false); setMode(newMode); setTimeLeft(durations[newMode]); };

  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="text-center">
        <h1 className="page-heading">Focus Mode</h1>
        <p className="page-subheading">Stay in the zone</p>
      </div>

      <div className="card text-center">
        <div className="flex justify-center gap-1 mb-4">
          {[
            { key: "pomodoro", label: "Focus" },
            { key: "break", label: "Break" },
            { key: "longBreak", label: "Long Break" },
          ].map((m) => (
            <button key={m.key} onClick={() => switchMode(m.key)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${mode === m.key ? "bg-accent text-white" : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"}`}>{m.label}</button>
          ))}
        </div>

        <div className="text-5xl font-mono font-bold mb-4">{formatTime(timeLeft)}</div>

        <div className="flex justify-center gap-3 mb-3">
          {!isRunning ? (
            <button onClick={toggleTimer} className="btn btn-primary">Start</button>
          ) : (
            <button onClick={toggleTimer} className="btn btn-primary bg-warning hover:bg-warning/90 border-warning">Pause</button>
          )}
          <button onClick={resetTimer} className="btn btn-ghost">Reset</button>
        </div>

        <p className="text-xs text-text-muted">Sessions: {sessions}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-2">Active Task</h2>
        <select className="input mb-2" value={activeTask?._id || ""}
          onChange={(e) => setActiveTask(tasks.find((t) => t._id === e.target.value) || null)}>
          <option value="">Select a task</option>
          {tasks.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
        </select>
        {activeTask && (
          <div className="p-2 rounded bg-accent-light text-sm">
            <p className="font-medium">{activeTask.title}</p>
            <p className="text-xs text-text-muted">{activeTask.estimatedDuration} min • {activeTask.priority}</p>
          </div>
        )}
      </div>
    </div>
  );
}
