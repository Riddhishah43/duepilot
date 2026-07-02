const Task = require("../models/task.model");
const Subtask = require("../models/subtask.model");
const Goal = require("../models/goal.model");
const groqService = require("../services/groq.service");
const calendarService = require("../services/calendar.service");

exports.analyzeTask = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const [subtasks, priority, risk] = await Promise.all([
      groqService.analyzeTaskBreakdown(task.title, task.description),
      groqService.predictPriority({
        title: task.title,
        deadline: task.deadline,
        estimatedDuration: task.estimatedDuration,
      }),
      groqService.analyzeRisk({
        title: task.title,
        deadline: task.deadline,
        progress: task.progress,
        estimatedDuration: task.estimatedDuration,
      }),
    ]);

    res.json({ subtasks, priority, risk });
  } catch (error) {
    next(error);
  }
};

exports.generateSchedule = async (req, res, next) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();

    const tasks = await Task.find({
      userId: req.user._id,
      status: { $in: ["pending", "in-progress"] },
      isArchived: false,
    }).sort({ priority: -1, deadline: 1 });

    const freeSlots = await calendarService.getFreeSlots(req.user._id, targetDate);
    const schedule = await groqService.createSmartSchedule(
      tasks.map((t) => ({
        id: t._id,
        title: t.title,
        deadline: t.deadline,
        estimatedDuration: t.estimatedDuration,
        priority: t.priority,
        progress: t.progress,
      })),
      freeSlots
    );

    res.json({ schedule, freeSlots });
  } catch (error) {
    next(error);
  }
};

exports.rescueMode = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      status: { $in: ["pending", "in-progress"] },
      isArchived: false,
    }).sort({ deadline: 1 });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No pending tasks to rescue" });
    }

    const tasksData = tasks.map((t) => ({
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      estimatedDuration: t.estimatedDuration,
      priority: t.priority,
      progress: t.progress,
      category: t.category,
      riskScore: t.riskScore,
      status: t.status,
    }));

    const preferences = {
      timezone: req.user.timezone,
      productivityScore: req.user.productivityScore,
    };

    let rescuePlan;
    try {
      rescuePlan = await groqService.createRescuePlan(tasksData, preferences);
    } catch (aiError) {
      rescuePlan = generateFallbackRescuePlan(tasksData);
    }

    res.json({ rescuePlan, totalTasks: tasks.length });
  } catch (error) {
    next(error);
  }
};

function generateFallbackRescuePlan(tasks) {
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const totalHours = tasks.reduce((s, t) => s + (t.estimatedDuration || 60) / 60, 0);
  const highRisk = tasks.filter((t) => t.riskScore >= 70 || t.priority === "high" || t.priority === "critical");
  const mediumRisk = tasks.filter((t) => t.riskScore >= 40 || t.priority === "medium");
  const lowRisk = tasks.filter((t) => t.riskScore < 40 && (t.priority === "low" || !t.priority));

  const crisisLevel = highRisk.length > 3 ? "critical" : highRisk.length > 1 ? "high" : mediumRisk.length > 2 ? "medium" : "low";
  const completionProbability = Math.max(5, Math.min(95, Math.round(100 - (totalHours / Math.max(1, tasks.length * 2)) * 50)));

  const schedule = [];
  for (let d = 0; d < 3; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const sessions = [];
    let hour = 9;
    const dayTasks = d === 0 ? highRisk.concat(mediumRisk.slice(0, 1)) : d === 1 ? mediumRisk.slice(1) : lowRisk;
    dayTasks.slice(0, 4).forEach((t) => {
      const dur = Math.min((t.estimatedDuration || 60), 180);
      const endH = hour + Math.ceil(dur / 60);
      sessions.push({
        time: `${String(hour).padStart(2, "0")}:00 - ${String(endH).padStart(2, "0")}:00`,
        task: t.title,
        type: highRisk.includes(t) ? "critical" : "normal",
      });
      hour = endH + 1;
    });
    if (sessions.length > 0) {
      schedule.push({
        day: d === 0 ? "Today" : d === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.toISOString().slice(0, 10),
        sessions,
      });
    }
  }

  return {
    overview: {
      totalTasks: tasks.length,
      totalAvailableHours: Math.max(8, Math.round(tasks.length * 2)),
      estimatedHoursNeeded: Math.round(totalHours),
      completionProbability,
      crisisLevel,
    },
    categories: {
      critical: highRisk.map((t) => ({
        title: t.title,
        duration: t.estimatedDuration || 60,
        deadline: new Date(t.deadline).toISOString().slice(0, 10),
        reason: t.riskScore >= 70 ? "High risk of missing deadline" : "High priority task",
      })),
      important: mediumRisk.map((t) => ({
        title: t.title,
        duration: t.estimatedDuration || 60,
        deadline: new Date(t.deadline).toISOString().slice(0, 10),
        reason: `Medium priority — ${t.progress > 0 ? `${t.progress}% done` : "not started"}`,
      })),
      optional: lowRisk.map((t) => ({
        title: t.title,
        duration: t.estimatedDuration || 60,
        deadline: new Date(t.deadline).toISOString().slice(0, 10),
        reason: "Low priority — can defer",
      })),
    },
    mergedTasks: [],
    extensionsToRequest: highRisk.filter((t) => t.riskScore >= 80).map((t) => {
      const newDate = new Date(t.deadline);
      newDate.setDate(newDate.getDate() + 3);
      return {
        task: t.title,
        currentDeadline: new Date(t.deadline).toISOString().slice(0, 10),
        suggestedDeadline: newDate.toISOString().slice(0, 10),
        reason: "AI recommends extension to reduce workload",
      };
    }),
    removedTasks: lowRisk.slice(2).map((t) => ({ task: t.title, reason: "Low priority — defer to next week" })),
    schedule,
    urgentActions: [
      `Start with "${highRisk[0]?.title || "first high-priority task"}" — highest risk, do this now`,
      `Focus on ${highRisk.length} critical tasks before anything else today`,
      highRisk.length > mediumRisk.length
        ? "You're overloaded — request extensions for non-critical work"
        : "You're on track — maintain current pace and watch your deadlines",
    ],
  };
}

exports.getDailyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      userId: req.user._id,
      deadline: { $gte: today, $lt: tomorrow },
    });

    const report = await groqService.generateDailyReport(
      {
        name: req.user.name,
        timezone: req.user.timezone,
        productivityScore: req.user.productivityScore,
      },
      tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        deadline: t.deadline,
      }))
    );

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyReport = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasks = await Task.find({
      userId: req.user._id,
      $or: [
        { deadline: { $gte: sevenDaysAgo } },
        { completedAt: { $gte: sevenDaysAgo } },
      ],
    });

    const report = await groqService.generateWeeklyReport(
      { name: req.user.name },
      tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        deadline: t.deadline,
        category: t.category,
      }))
    );

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.planGoal = async (req, res, next) => {
  try {
    const { goalId } = req.body;
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const plan = await groqService.planGoalMilestone({
      title: goal.title,
      deadline: goal.deadline,
      progress: goal.progress,
      milestones: goal.milestones,
    });

    res.json({ plan });
  } catch (error) {
    next(error);
  }
};

exports.generateReminder = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const reminder = await groqService.generateSmartReminder({
      title: task.title,
      deadline: task.deadline,
      estimatedDuration: task.estimatedDuration,
      progress: task.progress,
    });

    res.json({ reminder });
  } catch (error) {
    next(error);
  }
};
