const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    isWorkSession: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

calendarEventSchema.index({ userId: 1, start: 1, end: 1 });

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
