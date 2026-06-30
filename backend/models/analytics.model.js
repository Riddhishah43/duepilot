const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    productivityScore: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    missedTasks: { type: Number, default: 0 },
    hoursWorked: { type: Number, default: 0 },
    focusSessions: { type: Number, default: 0 },
    categoryBreakdown: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

analyticsSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
