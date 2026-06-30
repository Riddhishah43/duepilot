import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import TaskCard from "../components/common/TaskCard";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", deadline: "",
    priority: "medium",
  });

  useEffect(() => { loadTasks(); }, [filter]);

  const loadTasks = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const { data } = await api.get("/tasks", { params });
      setTasks(data.tasks);
    } catch (err) { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", form);
      toast.success("Task created! AI is analyzing...");
      setShowCreate(false);
      setForm({ title: "", description: "", deadline: "", priority: "medium" });
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create task"); }
  };

  const updateStatus = async (taskId, status) => {
    try { await api.put(`/tasks/${taskId}`, { status }); toast.success(`Task ${status}`); loadTasks(); }
    catch { toast.error("Failed to update task"); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try { await api.delete(`/tasks/${taskId}`); toast.success("Task deleted"); loadTasks(); }
    catch { toast.error("Failed to delete task"); }
  };

  const filters = ["all", "pending", "in-progress", "completed"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Tasks</h1>
          <p className="text-sm text-gray-500">Manage and track your tasks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">+ New Task</button>
      </div>

      <div className="flex gap-1.5 border-b border-gray-200 pb-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === f ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showCreate && (
        <form onSubmit={createTask} className="card space-y-3">
          <h2 className="font-semibold text-sm">New Task</h2>
          <input className="input-field" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input-field" placeholder="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Deadline</label>
            <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          </div>
          <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Create Task</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-400"><p className="text-3xl mb-2">📋</p><p className="text-sm">No tasks found</p></div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task._id} className="relative group">
              <TaskCard task={task} />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status !== "completed" && (
                  <button onClick={() => updateStatus(task._id, "completed")} className="p-1 rounded bg-priority-high/30 text-primary hover:bg-priority-high/50 text-xs leading-none">✓</button>
                )}
                {task.status === "pending" && (
                  <button onClick={() => updateStatus(task._id, "in-progress")} className="p-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs leading-none">▶</button>
                )}
                <button onClick={() => deleteTask(task._id)} className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-xs leading-none">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
