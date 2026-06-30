const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    action: {
      type: String,
      enum: [
        "task_created",
        "task_completed",
        "task_missed",
        "task_rescheduled",
        "task_updated",
        "task_deleted",
        "task_archived",
        "task_progress",
      ],
      required: true,
    },
    taskTitle: { type: String },
    category: { type: String, default: "general" },
    priority: { type: String, enum: ["low", "medium", "high"] },
    deadline: { type: Date },
    prevDeadline: { type: Date },
    estimatedDuration: { type: Number },
    progress: { type: Number },
    hourOfDay: { type: Number },
    dayOfWeek: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

actionLogSchema.index({ userId: 1, createdAt: -1 });
actionLogSchema.index({ userId: 1, action: 1 });
actionLogSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("ActionLog", actionLogSchema);
