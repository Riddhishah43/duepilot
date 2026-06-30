const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  examDate: { type: Date },
  assignmentDeadline: { type: Date },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
});

const dayScheduleSchema = new mongoose.Schema({
  date: { type: String },
  dayName: { type: String },
  sessions: [
    {
      subject: String,
      startTime: String,
      endTime: String,
      topic: String,
    },
  ],
});

const studyPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Study Plan" },
    subjects: [subjectSchema],
    availableHoursPerDay: { type: Number, required: true },
    preferredTime: { type: String, enum: ["morning", "afternoon", "night"], default: "morning" },
    daysOff: [{ type: String }],
    schedule: [dayScheduleSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studyPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
