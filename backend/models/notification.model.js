const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["deadline", "reminder", "suggestion", "risk_alert", "daily_report", "rescue", "smart"],
      default: "reminder",
    },
    subtype: {
      type: String,
      enum: ["start_now", "best_time", "rescue", "focus", "habit", "overload", "missed", "break", "prediction", "reinforcement", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    actionUrl: { type: String },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
