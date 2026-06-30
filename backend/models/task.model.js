const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    deadline: { type: Date, required: true },
    targetDeadline: { type: Date },
    estimatedDuration: { type: Number, default: 60 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    category: { type: String, default: "general" },
    tags: [{ type: String, trim: true }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: "" },
    attachments: [{ name: String, url: String }],
    status: { type: String, enum: ["pending", "in-progress", "completed", "missed"], default: "pending" },
    riskScore: { type: Number, default: 0 },
    riskReason: { type: String, default: "" },
    aiRecommendation: { type: String, default: "" },
    isArchived: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model("Task", taskSchema);
