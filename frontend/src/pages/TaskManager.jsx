import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import TaskCard from "../components/common/TaskCard";
import { ClipboardList, Check, Play, X } from "lucide-react";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", deadline: "",
    priority: "medium", estimatedDuration: 60,
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
      setForm({ title: "", description: "", deadline: "", priority: "medium", estimatedDuration: 60 });
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

  const filters = ["all", "pending", "in-progress", "completed", "missed"];

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Tasks</h1>
          <p className="page-subheading">Manage and track your tasks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary text-sm">
          + New Task
        </button>
      </div>

      <div className="tabs inline-flex">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`tab-item${filter === f ? " active" : ""}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showCreate && (
        <form onSubmit={createTask} className="card p-6 space-y-4">
          <h2 className="font-semibold text-sm">New Task</h2>
          <input
            className="input"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="input"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-text-muted">Deadline</label>
              <input
                type="date"
                className="input"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-text-muted">Duration (min)</label>
              <input
                type="number"
                className="input"
                min={5} max={1440}
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: parseInt(e.target.value) || 60 })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-text-muted">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn btn-primary text-sm">Create Task</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={36} className="mb-3 block mx-auto text-text-muted" />
          <p className="font-semibold text-sm mb-1 text-text-primary">No tasks found</p>
          <p className="text-sm text-text-muted">
            {filter === "all" ? "Create your first task to get started" : `No tasks with status "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task._id} className="relative group">
              <TaskCard task={task} />
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status !== "completed" && (
                  <button
                    onClick={() => updateStatus(task._id, "completed")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-success bg-success/15 hover:bg-success/25 transition-colors"
                    aria-label="Mark complete"
                  ><Check size={14} /></button>
                )}
                {task.status === "pending" && (
                  <button
                    onClick={() => updateStatus(task._id, "in-progress")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-warning bg-warning/15 hover:bg-warning/25 transition-colors"
                    aria-label="Start task"
                  ><Play size={14} /></button>
                )}
                <button
                  onClick={() => deleteTask(task._id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-danger bg-danger/15 hover:bg-danger/25 transition-colors"
                  aria-label="Delete task"
                ><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
