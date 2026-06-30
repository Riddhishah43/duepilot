const { validationResult } = require("express-validator");
const Task = require("../models/task.model");
const Subtask = require("../models/subtask.model");
const groqService = require("../services/groq.service");

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, archived, search } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status.includes(",") ? { $in: status.split(",") } : status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (archived === "true") filter.isArchived = true;
    else filter.isArchived = { $ne: true };
    if (search) filter.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(filter).sort({ deadline: 1, priority: -1 });
    res.json({ tasks });
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

    res.status(201).json({ task, subtasks });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.body.status === "completed") {
      task.completedAt = new Date();
      task.progress = 100;
      await task.save();
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
