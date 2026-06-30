const Goal = require("../models/goal.model");
const groqService = require("../services/groq.service");

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id, status: { $ne: "archived" } }).sort({ deadline: 1 });
    res.json({ goals });
  } catch (error) {
    next(error);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });

    try {
      const plan = await groqService.planGoalMilestone({
        title: goal.title,
        deadline: goal.deadline,
        progress: 0,
        milestones: [],
      });
      if (plan.nextMilestone) {
        goal.milestones.push({
          title: plan.nextMilestone.title,
          completed: false,
          deadline: plan.nextMilestone.deadline || goal.deadline,
        });
        await goal.save();
      }
    } catch (aiError) {
      console.error("AI goal planning failed:", aiError.message);
    }

    res.status(201).json({ goal });
  } catch (error) {
    next(error);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ goal });
  } catch (error) {
    next(error);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ message: "Goal deleted" });
  } catch (error) {
    next(error);
  }
};

exports.toggleMilestone = async (req, res, next) => {
  try {
    const { goalId, milestoneId } = req.params;
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    milestone.completed = !milestone.completed;
    const completedCount = goal.milestones.filter((m) => m.completed).length;
    goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
    await goal.save();

    res.json({ goal });
  } catch (error) {
    next(error);
  }
};
