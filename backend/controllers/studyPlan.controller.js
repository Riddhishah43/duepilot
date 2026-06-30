const StudyPlan = require("../models/studyPlan.model");
const groqService = require("../services/groq.service");

exports.createPlan = async (req, res, next) => {
  try {
    const { subjects, availableHoursPerDay, preferredTime, daysOff, title } = req.body;

    const plan = await StudyPlan.create({
      userId: req.user._id,
      title: title || "Study Plan",
      subjects,
      availableHoursPerDay,
      preferredTime: preferredTime || "morning",
      daysOff: daysOff || [],
    });

    const preferences = {
      availableHoursPerDay,
      preferredTime,
      daysOff: daysOff || [],
      startDate: new Date().toISOString().split("T")[0],
    };

    const aiPlan = await groqService.generateStudyPlan(subjects, preferences);

    plan.schedule = aiPlan.schedule;
    await plan.save();

    res.status(201).json({ plan, stats: aiPlan.stats, tips: aiPlan.tips });
  } catch (error) {
    next(error);
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (error) {
    next(error);
  }
};

exports.getPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    res.json({ plan });
  } catch (error) {
    next(error);
  }
};

exports.regeneratePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });

    const preferences = {
      availableHoursPerDay: plan.availableHoursPerDay,
      preferredTime: plan.preferredTime,
      daysOff: plan.daysOff || [],
      startDate: new Date().toISOString().split("T")[0],
    };

    const aiPlan = await groqService.generateStudyPlan(plan.subjects, preferences);

    plan.schedule = aiPlan.schedule;
    await plan.save();

    res.json({ plan, stats: aiPlan.stats, tips: aiPlan.tips });
  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    res.json({ message: "Study plan deleted" });
  } catch (error) {
    next(error);
  }
};
