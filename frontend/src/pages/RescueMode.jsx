import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function RescueMode() {
  const [riskyTasks, setRiskyTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rescuePlan, setRescuePlan] = useState(null);
  const [loading, setLoading] = useState({ tasks: true, rescue: false });

  useEffect(() => { loadRiskyTasks(); }, []);

  const loadRiskyTasks = async () => {
    try { const { data } = await api.get("/tasks/risky"); setRiskyTasks(data.tasks); }
    catch { toast.error("Failed to load risky tasks"); }
    finally { setLoading({ ...loading, tasks: false }); }
  };

  const activateRescue = async (task) => {
    setSelectedTask(task);
    setLoading({ ...loading, rescue: true });
    try { const { data } = await api.post("/ai/rescue", { taskId: task._id }); setRescuePlan(data.rescuePlan); }
    catch { toast.error("Failed to activate rescue mode"); }
    finally { setLoading({ ...loading, rescue: false }); }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center">
        <span className="text-3xl">🚨</span>
        <h1 className="text-lg font-semibold mt-1">Rescue Mode</h1>
        <p className="text-sm text-gray-500">AI-powered emergency assistance for critical deadlines</p>
      </div>

      {loading.tasks ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>
      ) : riskyTasks.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-semibold text-sm">No critical tasks!</p>
          <p className="text-xs text-gray-400">You're on top of your deadlines.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">Critical Tasks</h2>
          {riskyTasks.map((task) => (
            <div key={task._id} className="card border-l-3 border-red-500">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{task.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{task.riskReason}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="text-red-500 font-medium">Risk: {task.riskScore}%</span>
                    <span className="text-gray-400">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span className="text-gray-400">Progress: {task.progress}%</span>
                  </div>
                </div>
                <button onClick={() => activateRescue(task)} disabled={loading.rescue}
                  className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 shrink-0">
                  {loading.rescue && selectedTask?._id === task._id ? "..." : "Rescue"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rescuePlan && (
        <div className="card border border-red-300 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🚨</span>
            <h2 className="text-sm font-bold text-red-600">Rescue Mode Activated</h2>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Completion Probability</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${rescuePlan.estimatedCompletionProbability || 0}%` }} />
              </div>
              <span className="font-bold text-sm">{rescuePlan.estimatedCompletionProbability || 0}%</span>
            </div>
          </div>
          {rescuePlan.essentialTasks?.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-medium mb-1">Essential Tasks</h3>
              <div className="space-y-1">
                {rescuePlan.essentialTasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-white border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-medium">{i + 1}</span>
                    <span className="flex-1">{t.title}</span>
                    <span className="text-gray-400">{t.duration} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {rescuePlan.urgentActions?.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-medium mb-1">Urgent Actions</h3>
              <ul className="space-y-0.5">{rescuePlan.urgentActions.map((a, i) => <li key={i} className="text-xs text-gray-600">• {a}</li>)}</ul>
            </div>
          )}
          {rescuePlan.optimizedSchedule?.length > 0 && (
            <div>
              <h3 className="text-xs font-medium mb-1">Schedule</h3>
              <div className="space-y-1">{rescuePlan.optimizedSchedule.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-white border border-gray-100">
                  <span className="text-gray-400 w-14">{s.time}</span>
                  <span>{s.action}</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
