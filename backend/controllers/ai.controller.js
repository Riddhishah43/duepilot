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
    const { taskId } = req.body;
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const rescuePlan = await groqService.createRescuePlan({
      title: task.title,
      deadline: task.deadline,
      progress: task.progress,
      estimatedDuration: task.estimatedDuration,
      description: task.description,
    });

    res.json({ rescuePlan, task });
  } catch (error) {
    next(error);
  }
};

exports.getDailyReport = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      userId: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
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
      createdAt: { $gte: sevenDaysAgo },
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
