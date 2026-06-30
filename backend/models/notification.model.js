const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["deadline", "reminder", "suggestion", "risk_alert", "daily_report", "rescue"],
      default: "reminder",
    },
    read: { type: Boolean, default: false },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
