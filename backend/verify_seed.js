require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require("./models/user.model");
  const Task = require("./models/task.model");
  const Goal = require("./models/goal.model");
  const Analytics = require("./models/analytics.model");
  const Notification = require("./models/notification.model");
  const CalendarEvent = require("./models/calendarEvent.model");
  const ActionLog = require("./models/actionLog.model");
  const StudyPlan = require("./models/studyPlan.model");
  const Subtask = require("./models/subtask.model");

  const user = await User.findOne({ email: "riddhi@duepilot.com" });
  if (!user) { console.log("User not found!"); process.exit(1); }

  const uid = user._id;
  const tasks = await Task.countDocuments({ userId: uid });
  const completed = await Task.countDocuments({ userId: uid, status: "completed" });
  const pending = await Task.countDocuments({ userId: uid, status: { $in: ["pending", "in-progress"] } });
  const subtasks = await Subtask.countDocuments({});
  const goals = await Goal.countDocuments({ userId: uid });
  const analytics = await Analytics.countDocuments({ userId: uid });
  const notifs = await Notification.countDocuments({ userId: uid });
  const events = await CalendarEvent.countDocuments({ userId: uid });
  const logs = await ActionLog.countDocuments({ userId: uid });
  const plans = await StudyPlan.countDocuments({ userId: uid });

  console.log("========== DATA VERIFICATION ==========");
  console.log("Test Account:");
  console.log("  Name:     " + user.name);
  console.log("  Email:    riddhi@duepilot.com");
  console.log("  Password: Test@1234");
  console.log("  Timezone: " + user.timezone);
  console.log("  Created:  " + user.createdAt);
  console.log("  Theme:    " + user.theme);
  console.log("");
  console.log("Records:");
  console.log("  Tasks:         " + tasks + " (completed: " + completed + ", pending: " + pending + ")");
  console.log("  Subtasks:      " + subtasks);
  console.log("  Goals:         " + goals);
  console.log("  Analytics:     " + analytics + " (30 days)");
  console.log("  Notifications: " + notifs);
  console.log("  Calendar Evts: " + events);
  console.log("  Action Logs:   " + logs);
  console.log("  Study Plans:   " + plans);
  console.log("========================================");

  mongoose.disconnect();
}).catch(e => { console.error(e); process.exit(1); });
