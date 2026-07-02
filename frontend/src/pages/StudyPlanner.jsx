import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [subjects, setSubjects] = useState([
    { name: "", examDate: "", assignmentDeadline: "", difficulty: "medium" },
  ]);
  const [preferences, setPreferences] = useState({
    availableHoursPerDay: 4,
    preferredTime: "morning",
    daysOff: [],
    title: "",
  });

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const { data } = await api.get("/study-plans");
      setPlans(data.plans || []);
    } catch { /* ignore */ }
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", examDate: "", assignmentDeadline: "", difficulty: "medium" }]);
  };

  const removeSubject = (i) => {
    if (subjects.length === 1) return;
    setSubjects(subjects.filter((_, idx) => idx !== i));
  };

  const updateSubject = (i, field, value) => {
    const updated = [...subjects];
    updated[i][field] = value;
    setSubjects(updated);
  };

  const toggleDayOff = (day) => {
    setPreferences((p) => ({
      ...p,
      daysOff: p.daysOff.includes(day) ? p.daysOff.filter((d) => d !== day) : [...p.daysOff, day],
    }));
  };

  const generatePlan = async () => {
    const validSubjects = subjects.filter((s) => s.name.trim());
    if (validSubjects.length === 0) {
      toast.error("Add at least one subject");
      return;
    }
    setGenerating(true);
    try {
      const payload = {
        subjects: validSubjects.map((s) => ({
          name: s.name.trim(),
          examDate: s.examDate || undefined,
          assignmentDeadline: s.assignmentDeadline || undefined,
          difficulty: s.difficulty,
        })),
        availableHoursPerDay: preferences.availableHoursPerDay,
        preferredTime: preferences.preferredTime,
        daysOff: preferences.daysOff,
        title: preferences.title || undefined,
      };
      const { data } = await api.post("/study-plans", payload);
      setSelectedPlan(data.plan);
      loadPlans();
      toast.success("Study plan generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate study plan");
    } finally {
      setGenerating(false);
    }
  };

  const regeneratePlan = async (planId) => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/study-plans/${planId}/regenerate`);
      setSelectedPlan(data.plan);
      loadPlans();
      toast.success("Plan regenerated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to regenerate plan");
    } finally {
      setGenerating(false);
    }
  };

  const deletePlan = async (planId) => {
    try {
      await api.delete(`/study-plans/${planId}`);
      if (selectedPlan?._id === planId) setSelectedPlan(null);
      loadPlans();
      toast.success("Plan deleted");
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const getDaySchedule = (plan, dayName) => {
    return plan.schedule?.find((d) => d.dayName === dayName);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-heading">AI Study Planner</h1>
        <p className="page-subheading">Create personalized study schedules with AI</p>
      </div>

      {!selectedPlan && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm">Subjects</h2>
          {subjects.map((subject, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2 p-3 rounded bg-bg-secondary">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-text-muted mb-0.5 block">Subject Name</label>
                <input value={subject.name} onChange={(e) => updateSubject(i, "name", e.target.value)} placeholder="e.g. Data Structures" className="input text-sm" />
              </div>
              <div className="w-[140px]">
                <label className="text-xs text-text-muted mb-0.5 block">Exam Date</label>
                <input type="date" value={subject.examDate} onChange={(e) => updateSubject(i, "examDate", e.target.value)} className="input text-sm" />
              </div>
              <div className="w-[140px]">
                <label className="text-xs text-text-muted mb-0.5 block">Assignment Deadline</label>
                <input type="date" value={subject.assignmentDeadline} onChange={(e) => updateSubject(i, "assignmentDeadline", e.target.value)} className="input text-sm" />
              </div>
              <div className="w-[120px]">
                <label className="text-xs text-text-muted mb-0.5 block">Difficulty</label>
                <select value={subject.difficulty} onChange={(e) => updateSubject(i, "difficulty", e.target.value)} className="input text-sm">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button onClick={() => removeSubject(i)} className="text-danger hover:text-danger/80 text-lg p-1">&times;</button>
            </div>
          ))}
          <button onClick={addSubject} className="text-sm text-accent hover:underline">+ Add Subject</button>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs text-text-muted mb-0.5 block">Study Hours / Day</label>
              <input type="number" min={1} max={16} value={preferences.availableHoursPerDay} onChange={(e) => setPreferences({ ...preferences, availableHoursPerDay: Number(e.target.value) })} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-0.5 block">Preferred Time</label>
              <select value={preferences.preferredTime} onChange={(e) => setPreferences({ ...preferences, preferredTime: e.target.value })} className="input text-sm">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-0.5 block">Plan Title (optional)</label>
              <input value={preferences.title} onChange={(e) => setPreferences({ ...preferences, title: e.target.value })} placeholder="e.g. Semester 1 Plan" className="input text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Days Off</label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => (
                <button key={day} onClick={() => toggleDayOff(day)} className={`px-3 py-1 text-xs rounded border transition-colors ${preferences.daysOff.includes(day) ? "bg-danger-light border-danger text-danger" : "bg-bg-tertiary border-border text-text-muted hover:border-border"}`}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generatePlan} disabled={generating} className="btn btn-primary text-sm">
            {generating ? "Generating..." : "Generate Study Plan"}
          </button>
        </div>
      )}

      {selectedPlan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">{selectedPlan.title}</h2>
            <div className="flex gap-2">
              <button onClick={() => regeneratePlan(selectedPlan._id)} disabled={generating} className="btn btn-ghost text-xs">Regenerate</button>
              <button onClick={() => deletePlan(selectedPlan._id)} className="text-xs text-danger hover:text-danger/80 px-3 py-1 rounded hover:bg-danger-light">Delete</button>
              <button onClick={() => setSelectedPlan(null)} className="btn btn-ghost text-xs">New Plan</button>
            </div>
          </div>

          <div className="grid gap-3">
            {selectedPlan.schedule?.map((day, i) => (
              <div key={i} className="card">
                <h3 className="text-sm font-medium mb-2 text-accent">{day.dayName} — {day.date}</h3>
                <div className="space-y-1.5">
                  {day.sessions?.map((session, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm p-2 rounded bg-bg-secondary">
                      <span className="text-xs font-medium text-accent w-28 shrink-0">{session.startTime} – {session.endTime}</span>
                      <span className="font-medium">{session.subject}</span>
                      {session.topic && <span className="text-text-muted text-xs">— {session.topic}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plans.length > 0 && !selectedPlan && (
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Previous Plans</h2>
          <div className="space-y-1.5">
            {plans.map((plan) => (
              <div key={plan._id} className="flex items-center justify-between p-2 rounded hover:bg-bg-secondary cursor-pointer" onClick={() => setSelectedPlan(plan)}>
                <div>
                  <p className="text-sm font-medium">{plan.title}</p>
                  <p className="text-xs text-text-muted">{plan.subjects?.length} subjects · {plan.schedule?.length || 0} days</p>
                </div>
                <span className="text-xs text-text-muted">{new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
