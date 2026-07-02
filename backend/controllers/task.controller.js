const { validationResult } = require("express-validator");
const Task = require("../models/task.model");
const Subtask = require("../models/subtask.model");
const groqService = require("../services/groq.service");
const { logAction } = require("../services/pattern.service");
const { paginate, paginationMeta } = require("../utils/paginate");

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, archived, search, page, limit } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status.includes(",") ? { $in: status.split(",") } : status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (archived === "true") filter.isArchived = true;
    else filter.isArchived = { $ne: true };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escaped, $options: "i" };
    }

    const total = await Task.countDocuments(filter);
    const tasks = await paginate(Task.find(filter).sort({ deadline: 1, priority: -1 }), page, limit);
    res.json({ tasks, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const subtasks = await Subtask.find({ taskId: task._id }).sort({ suggestedOrder: 1 });
    res.json({ task, subtasks });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const task = await Task.create({ ...req.body, userId: req.user._id });

    let subtasks = [];
    if (task.estimatedDuration >= 120) {
      try {
        const breakdown = await groqService.analyzeTaskBreakdown(task.title, task.description);
        if (breakdown.subtasks && Array.isArray(breakdown.subtasks)) {
          subtasks = await Subtask.insertMany(
            breakdown.subtasks.map((st, i) => ({
              taskId: task._id,
              title: st.title,
              duration: st.duration || 30,
              suggestedOrder: st.suggestedOrder || i + 1,
            }))
          );
        } else if (Array.isArray(breakdown)) {
          subtasks = await Subtask.insertMany(
            breakdown.map((st, i) => ({
              taskId: task._id,
              title: st.title,
              duration: st.duration || 30,
              suggestedOrder: st.suggestedOrder || i + 1,
            }))
          );
        }
      } catch (aiError) {
        console.error("AI breakdown failed:", aiError.message);
      }
    }

    if (!req.body.priority) {
      try {
        const priorityResult = await groqService.predictPriority({
          title: task.title,
          deadline: task.deadline,
          estimatedDuration: task.estimatedDuration,
        });
        if (priorityResult.priority) {
          task.priority = priorityResult.priority;
          await task.save();
        }
      } catch (aiError) {
        console.error("AI priority prediction failed:", aiError.message);
      }
    }

    logAction(req.user._id, "task_created", task);

    res.status(201).json({ task, subtasks });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const existingTask = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const hadDeadlineChange = req.body.deadline && (
      new Date(req.body.deadline).toISOString().split("T")[0] !==
      existingTask.deadline?.toISOString()?.split("T")[0]
    );

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (req.body.status === "completed" && existingTask.status !== "completed") {
      task.completedAt = new Date();
      task.progress = 100;
      await task.save();
      logAction(req.user._id, "task_completed", task);
    } else if (req.body.status === "missed" && existingTask.status !== "missed") {
      logAction(req.user._id, "task_missed", task);
    } else if (hadDeadlineChange) {
      logAction(req.user._id, "task_rescheduled", task, { prevDeadline: existingTask.deadline });
    } else {
      logAction(req.user._id, "task_updated", task);
    }

    if (req.body.progress !== undefined) {
      logAction(req.user._id, "task_progress", task, { progress: req.body.progress });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await Subtask.deleteMany({ taskId: task._id });
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

exports.archiveTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isArchived: true },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task archived", task });
  } catch (error) {
    next(error);
  }
};

exports.getRiskyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      status: { $in: ["pending", "in-progress"] },
      isArchived: false,
    });

    const riskyTasks = [];
    for (const task of tasks) {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const totalTime = deadline - task.createdAt;
      const elapsed = now - task.createdAt;
      const progress = task.progress;
      const expectedProgress = Math.min(100, (elapsed / totalTime) * 100);

      if (deadline < now) {
        riskyTasks.push({ ...task.toObject(), riskScore: 100, riskReason: "Deadline has passed" });
        continue;
      }

      const riskScore = Math.min(100, Math.round(Math.max(0, expectedProgress - progress) * 1.5));
      if (riskScore > 50) {
        try {
          const aiRisk = await groqService.analyzeRisk({
            title: task.title,
            deadline: task.deadline,
            progress: task.progress,
            estimatedDuration: task.estimatedDuration,
          });
          riskyTasks.push({
            ...task.toObject(),
            riskScore: aiRisk.riskScore || riskScore,
            riskReason: aiRisk.reason || `Behind schedule`,
          });
        } catch {
          riskyTasks.push({ ...task.toObject(), riskScore, riskReason: "Behind schedule" });
        }
      }
    }

    res.json({ tasks: riskyTasks.sort((a, b) => b.riskScore - a.riskScore) });
  } catch (error) {
    next(error);
  }
};
