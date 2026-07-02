require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
const Task = require("./models/task.model");
const Subtask = require("./models/subtask.model");
const Goal = require("./models/goal.model");
const Analytics = require("./models/analytics.model");
const Notification = require("./models/notification.model");
const CalendarEvent = require("./models/calendarEvent.model");
const ActionLog = require("./models/actionLog.model");
const StudyPlan = require("./models/studyPlan.model");

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function subDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

const now = new Date();

const TEST_USER = {
  name: "Google Developer",
  email: "googledev@duepilot.com",
  password: "Test@1234",
  timezone: "Asia/Kolkata",
  bio: "Computer Science student and productivity enthusiast",
  dailyGoal: 5,
  weeklyGoal: 15,
  preferredStudyTime: "morning",
  defaultView: "list",
  productivityScore: 72,
  notificationPreferences: {
    startNow: true, bestTime: true, rescue: true,
    focus: true, habit: true, overload: true,
    missed: true, break: false, prediction: true, reinforcement: true,
  },
  focusPreferences: {
    pomodoroDuration: 25, breakDuration: 5,
    longBreakDuration: 15, sessionsBeforeLongBreak: 4,
  },
};

const CATEGORIES = ["academics", "personal", "work", "health", "finance", "projects", "creative", "social"];
const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["pending", "in-progress", "completed", "missed"];

const TASK_TEMPLATES = [
  { title: "Complete Machine Learning Assignment", description: "Implement linear regression from scratch and document", category: "academics", estimatedDuration: 180, priority: "high" },
  { title: "Prepare Data Structures Presentation", description: "Create slides on binary trees and BST operations", category: "academics", estimatedDuration: 120, priority: "high" },
  { title: "Read Chapter 5 - Database Systems", description: "Cover normalization and indexing topics", category: "academics", estimatedDuration: 90, priority: "medium" },
  { title: "Solve Calculus Problem Set", description: "Complete problems 1-20 from Chapter 3", category: "academics", estimatedDuration: 150, priority: "medium" },
  { title: "Write Research Paper Outline", description: "Draft outline for AI in Education paper", category: "academics", estimatedDuration: 60, priority: "high" },
  { title: "Review OS Concepts for Quiz", description: "Process scheduling, memory management, file systems", category: "academics", estimatedDuration: 120, priority: "high" },
  { title: "Build Portfolio Website", description: "Deploy personal portfolio with React and Tailwind", category: "projects", estimatedDuration: 240, priority: "medium" },
  { title: "Submit Internship Application", description: "Apply to Google SWE internship with updated resume", category: "work", estimatedDuration: 45, priority: "high" },
  { title: "Practice LeetCode Medium Problems", description: "Solve 5 medium difficulty problems on arrays and DP", category: "personal", estimatedDuration: 120, priority: "medium" },
  { title: "Update GitHub README", description: "Add project descriptions and tech stack badges", category: "projects", estimatedDuration: 30, priority: "low" },
  { title: "Plan Weekly Meal Prep", description: "Create grocery list and meal schedule for the week", category: "health", estimatedDuration: 45, priority: "low" },
  { title: "Pay Credit Card Bill", description: "Due before 5th of next month, avoid late fee", category: "finance", estimatedDuration: 10, priority: "high" },
  { title: "Complete UI Design for Side Project", description: "Design the dashboard layout in Figma", category: "creative", estimatedDuration: 90, priority: "medium" },
  { title: "Watch System Design Video", description: "YouTube: Design Netflix - 1 hour deep dive", category: "work", estimatedDuration: 60, priority: "low" },
  { title: "Write Blog Post on Productivity", description: "Share tips on using AI for task management", category: "creative", estimatedDuration: 120, priority: "low" },
  { title: "Fix Login Bug in Side Project", description: "JWT token expiration not handled properly", category: "projects", estimatedDuration: 60, priority: "high" },
  { title: "Attend Webinar on Cloud Computing", description: "AWS free webinar on serverless architecture", category: "work", estimatedDuration: 90, priority: "medium" },
  { title: "Organize Study Notes", description: "Compile all semester notes into structured PDF", category: "academics", estimatedDuration: 120, priority: "medium" },
  { title: "Morning Yoga Routine", description: "30 min yoga session, focus on back and neck stretches", category: "health", estimatedDuration: 30, priority: "low" },
  { title: "Call Family", description: "Weekly catch-up call with parents", category: "social", estimatedDuration: 30, priority: "low" },
  { title: "Review Budget for This Month", description: "Track expenses and adjust budget allocations", category: "finance", estimatedDuration: 30, priority: "medium" },
  { title: "Complete Python Automation Script", description: "Script to organize downloads folder by file type", category: "projects", estimatedDuration: 90, priority: "medium" },
  { title: "Prepare for System Design Interview", description: "Study microservices, caching, load balancing", category: "work", estimatedDuration: 180, priority: "high" },
  { title: "Contribute to Open Source", description: "Find a good first issue and submit PR", category: "projects", estimatedDuration: 120, priority: "medium" },
  { title: "Clean Up Email Inbox", description: "Unsubscribe from newsletters, archive old emails", category: "personal", estimatedDuration: 30, priority: "low" },
  { title: "Read 'Atomic Habits' - Chapter 3", description: "Focus on habit stacking and environment design", category: "personal", estimatedDuration: 45, priority: "low" },
  { title: "Set Up CI/CD Pipeline", description: "GitHub Actions for automated testing and deployment", category: "projects", estimatedDuration: 120, priority: "high" },
  { title: "Draft Freelance Proposal", description: "Write proposal for website development project", category: "work", estimatedDuration: 60, priority: "medium" },
  { title: "Backup Important Files", description: "Upload documents to Google Drive and cloud storage", category: "personal", estimatedDuration: 30, priority: "low" },
  { title: "Complete Code Review", description: "Review 3 PRs from team members", category: "work", estimatedDuration: 60, priority: "medium" },
];

const GOAL_TEMPLATES = [
  { title: "Master Data Structures & Algorithms", description: "Complete 200 LeetCode problems and understand all core data structures", deadline: addDays(now, 90), category: "academics" },
  { title: "Build Full-Stack Portfolio", description: "Create 3 production-ready full-stack applications", deadline: addDays(now, 120), category: "projects" },
  { title: "Get Fit for Summer", description: "Exercise 5 times per week, achieve consistent workout routine", deadline: addDays(now, 60), category: "health" },
  { title: "Learn System Design", description: "Master distributed systems, microservices, and cloud architecture", deadline: addDays(now, 150), category: "work" },
  { title: "Save for Travel Fund", description: "Save $2000 for end-of-year trip", deadline: addDays(now, 180), category: "finance" },
];

const NOTIF_TYPES = ["deadline", "reminder", "suggestion", "risk_alert", "daily_report", "rescue", "smart"];
const NOTIF_SUBTYPES = ["start_now", "best_time", "rescue", "focus", "habit", "overload", "missed", "break", "prediction", "reinforcement", "general"];

const NOTIF_TEMPLATES = [
  { title: "Deadline Approaching", message: "Your task is due in less than 24 hours. Start now to stay on track.", type: "deadline", subtype: "start_now" },
  { title: "Peak Productivity Time", message: "Your most productive hours are now. Tackle your hardest task first!", type: "suggestion", subtype: "best_time" },
  { title: "You're on Fire!", message: "Completed 3 tasks today. Keep up the momentum!", type: "reminder", subtype: "reinforcement" },
  { title: "High Risk Detected", message: "AI predicts you might miss this deadline. Consider prioritizing now.", type: "risk_alert", subtype: "prediction" },
  { title: "Rescue Mode Available", message: "Multiple deadlines are approaching. Activate Rescue Mode for a survival plan.", type: "rescue", subtype: "rescue" },
  { title: "Focus Session Suggested", message: "You haven't logged any focus time today. A 25-min session can help.", type: "suggestion", subtype: "focus" },
  { title: "Task Rescheduled", message: "A task was moved to next week. Review your updated schedule.", type: "reminder", subtype: "missed" },
  { title: "Streak at Risk", message: "You've completed tasks for 5 days straight. Don't break the chain!", type: "reminder", subtype: "habit" },
  { title: "Take a Break", message: "You've been working for 2 hours straight. A short break can boost focus.", type: "suggestion", subtype: "break" },
  { title: "Schedule Overload", message: "You have 8 tasks scheduled today. Consider rescheduling less urgent ones.", type: "suggestion", subtype: "overload" },
];

const STUDY_SUBJECTS = [
  { name: "Data Structures", examDate: formatDate(addDays(now, 30)), difficulty: "hard" },
  { name: "Database Systems", examDate: formatDate(addDays(now, 25)), difficulty: "medium" },
  { name: "Operating Systems", examDate: formatDate(addDays(now, 35)), difficulty: "hard" },
  { name: "Computer Networks", examDate: formatDate(addDays(now, 40)), difficulty: "medium" },
  { name: "Software Engineering", examDate: formatDate(addDays(now, 20)), difficulty: "easy" },
];

const SESSION_TOPICS = [
  "Introduction & Overview", "Core Concepts", "Practice Problems", "Revision",
  "Advanced Topics", "Previous Year Questions", "Key Algorithms",
  "Implementation", "Case Studies", "Important Theorems",
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");

    // Clear existing test data
    const existingUser = await User.findOne({ email: TEST_USER.email });
    if (existingUser) {
      console.log("Clearing existing test data...");
      await Task.deleteMany({ userId: existingUser._id });
      await Subtask.deleteMany({});
      await Goal.deleteMany({ userId: existingUser._id });
      await Analytics.deleteMany({ userId: existingUser._id });
      await Notification.deleteMany({ userId: existingUser._id });
      await CalendarEvent.deleteMany({ userId: existingUser._id });
      await ActionLog.deleteMany({ userId: existingUser._id });
      await StudyPlan.deleteMany({ userId: existingUser._id });
      await User.findByIdAndDelete(existingUser._id);
      console.log("Existing data cleared");
    }

    // Create test user
    console.log("Creating test user...");
    const user = await User.create({ ...TEST_USER, password: TEST_USER.password, createdAt: new Date("2026-06-27T00:00:00.000Z") });
    console.log(`Test user created: ${user.email}`);

    // Create Tasks (spread across last 30 days and next 30 days)
    console.log("Creating tasks...");
    const createdTasks = [];
    for (let i = 0; i < 30; i++) {
      const template = TASK_TEMPLATES[i % TASK_TEMPLATES.length];
      const daysOffset = i < 15 ? -15 + i : i - 15;
      const deadline = addDays(now, daysOffset);
      const status = deadline < now
        ? randomElement(["completed", "completed", "completed", "missed", "in-progress"])
        : randomElement(["pending", "pending", "in-progress", "in-progress"]);
      const isCompleted = status === "completed";
      const progress = status === "completed" ? 100
        : status === "in-progress" ? randomInt(20, 80)
        : status === "missed" ? randomInt(0, 30)
        : 0;

      const task = await Task.create({
        userId: user._id,
        title: template.title,
        description: template.description,
        deadline,
        estimatedDuration: template.estimatedDuration,
        priority: status === "completed" ? randomElement(PRIORITIES) : template.priority,
        category: template.category,
        tags: [template.category, status],
        progress,
        status,
        riskScore: status === "pending" && deadline < addDays(now, 3) ? randomInt(60, 95) : randomInt(0, 40),
        riskReason: "",
        isArchived: false,
        completedAt: isCompleted ? subDays(now, randomInt(0, 20)) : undefined,
      });
      createdTasks.push(task);

      // Create subtasks for large tasks
      if (template.estimatedDuration >= 120) {
        const subtaskTitles = [
          `Research ${template.category}`,
          `Plan approach`,
          `Draft initial version`,
          `Review and refine`,
          `Finalize and submit`
        ];
        for (let s = 0; s < randomInt(2, 4); s++) {
          await Subtask.create({
            taskId: task._id,
            title: subtaskTitles[s] || `Step ${s + 1}`,
            completed: isCompleted || (status === "in-progress" && s === 0),
            duration: Math.round(template.estimatedDuration / 5),
            suggestedOrder: s + 1,
          });
        }
      }

      // Create action log entries
      if (isCompleted) {
        await ActionLog.create({
          userId: user._id,
          taskId: task._id,
          action: "task_created",
          taskTitle: task.title,
          category: task.category,
          priority: task.priority,
          deadline: task.deadline,
          estimatedDuration: task.estimatedDuration,
          progress: 0,
          hourOfDay: randomInt(8, 22),
          dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(task.completedAt).getDay()],
          createdAt: subDays(task.completedAt, randomInt(1, 5)),
        });
        await ActionLog.create({
          userId: user._id,
          taskId: task._id,
          action: "task_completed",
          taskTitle: task.title,
          category: task.category,
          priority: task.priority,
          deadline: task.deadline,
          estimatedDuration: task.estimatedDuration,
          progress: 100,
          hourOfDay: randomInt(8, 22),
          dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(task.completedAt).getDay()],
          createdAt: task.completedAt,
        });
      } else if (status === "missed") {
        await ActionLog.create({
          userId: user._id,
          taskId: task._id,
          action: "task_missed",
          taskTitle: task.title,
          category: task.category,
          priority: task.priority,
          deadline: task.deadline,
          estimatedDuration: task.estimatedDuration,
          progress: task.progress,
          hourOfDay: new Date(task.deadline).getHours(),
          dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(task.deadline).getDay()],
          createdAt: task.deadline,
        });
      } else {
        await ActionLog.create({
          userId: user._id,
          taskId: task._id,
          action: "task_created",
          taskTitle: task.title,
          category: task.category,
          priority: task.priority,
          deadline: task.deadline,
          estimatedDuration: task.estimatedDuration,
          progress: task.progress,
          hourOfDay: randomInt(8, 22),
          dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(task.createdAt).getDay()],
          createdAt: task.createdAt,
        });
        if (status === "in-progress") {
          await ActionLog.create({
            userId: user._id,
            taskId: task._id,
            action: "task_progress",
            taskTitle: task.title,
            category: task.category,
            priority: task.priority,
            deadline: task.deadline,
            estimatedDuration: task.estimatedDuration,
            progress: task.progress,
            hourOfDay: randomInt(8, 22),
            dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()],
          });
        }
      }
    }
    console.log(`Created ${createdTasks.length} tasks with subtasks and action logs`);

    // Create Goals with milestones
    console.log("Creating goals...");
    for (const template of GOAL_TEMPLATES) {
      const milestones = [
        { title: "Research & Planning", completed: true, deadline: addDays(now, -30) },
        { title: "Phase 1 Implementation", completed: true, deadline: addDays(now, -10) },
        { title: "Phase 2 Implementation", completed: false, deadline: addDays(now, 20) },
        { title: "Review & Polish", completed: false, deadline: addDays(now, 45) },
        { title: "Completion", completed: false, deadline: template.deadline },
      ];
      const completedMilestones = milestones.filter(m => m.completed).length;
      const progress = Math.round((completedMilestones / milestones.length) * 100);

      await Goal.create({
        userId: user._id,
        title: template.title,
        description: template.description,
        deadline: template.deadline,
        progress,
        milestones,
        category: template.category,
        status: "active",
      });
    }
    console.log(`Created ${GOAL_TEMPLATES.length} goals with milestones`);

    // Create Analytics entries for 30 days
    console.log("Creating analytics records...");
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const completedOnDay = createdTasks.filter(t =>
        t.completedAt && new Date(t.completedAt).toDateString() === date.toDateString()
      ).length;
      const missedOnDay = createdTasks.filter(t =>
        t.status === "missed" && new Date(t.deadline).toDateString() === date.toDateString()
      ).length;
      const pendingOnDay = createdTasks.filter(t =>
        (t.status === "pending" || t.status === "in-progress") && new Date(t.deadline).toDateString() === date.toDateString()
      ).length;
      const score = completedOnDay > 0
        ? Math.min(100, Math.round((completedOnDay / Math.max(1, completedOnDay + missedOnDay)) * 100))
        : randomInt(0, 60);

      await Analytics.create({
        userId: user._id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        productivityScore: score,
        completedTasks: completedOnDay,
        missedTasks: missedOnDay,
        hoursWorked: completedOnDay * randomInt(1, 3),
        focusSessions: randomInt(0, 4),
        pendingTasks: pendingOnDay,
        categoryBreakdown: { general: completedOnDay },
      });
    }
    console.log("Created 30 days of analytics records");

    // Create Calendar Events
    console.log("Creating calendar events...");
    for (let i = 0; i < 20; i++) {
      const dayOffset = i < 10 ? -5 + i : i - 5;
      const date = addDays(now, dayOffset);
      const startHour = randomInt(8, 18);
      const start = new Date(date);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(date);
      end.setHours(startHour + randomInt(1, 3), 0, 0, 0);

      await CalendarEvent.create({
        userId: user._id,
        taskId: createdTasks[i % createdTasks.length]._id,
        title: `Work: ${createdTasks[i % createdTasks.length].title.slice(0, 30)}`,
        start,
        end,
        isWorkSession: true,
        isCompleted: start < now,
      });
    }
    console.log("Created 20 calendar events");

    // Create Notifications
    console.log("Creating notifications...");
    for (let i = 0; i < 25; i++) {
      const template = NOTIF_TEMPLATES[i % NOTIF_TEMPLATES.length];
      const notifDate = subDays(now, randomInt(0, 14));
      await Notification.create({
        userId: user._id,
        title: template.title,
        message: template.message,
        type: template.type,
        subtype: template.subtype,
        read: randomElement([true, true, false]),
        taskId: createdTasks[i % createdTasks.length]._id,
        actionUrl: randomElement(["/tasks", "/focus", "/rescue", "/insights", null]),
        priority: randomInt(0, 100),
        createdAt: notifDate,
      });
    }
    console.log("Created 25 notifications");

    // Create Study Plan
    console.log("Creating study plan...");
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const schedule = [];
    for (let d = 0; d < 14; d++) {
      const date = addDays(now, d);
      const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
      if (dayName === "Saturday" || dayName === "Sunday") continue;

      const sessions = [];
      const numSessions = randomInt(2, 4);
      for (let s = 0; s < numSessions; s++) {
        const subject = STUDY_SUBJECTS[s % STUDY_SUBJECTS.length];
        const startH = 9 + s * 2;
        sessions.push({
          subject: subject.name,
          startTime: `${String(startH).padStart(2, "0")}:00`,
          endTime: `${String(startH + 1).padStart(2, "0")}:30`,
          topic: SESSION_TOPICS[(d + s) % SESSION_TOPICS.length],
        });
      }
      schedule.push({
        date: formatDate(date),
        dayName,
        sessions,
      });
    }

    await StudyPlan.create({
      userId: user._id,
      title: "Semester 6 Study Plan",
      subjects: STUDY_SUBJECTS,
      availableHoursPerDay: 6,
      preferredTime: "morning",
      daysOff: ["Saturday", "Sunday"],
      schedule,
      isActive: true,
    });
    console.log("Created study plan with 2-week schedule");

    // Summary
    const taskCount = await Task.countDocuments({ userId: user._id });
    const subtaskCount = await Subtask.countDocuments({});
    const goalCount = await Goal.countDocuments({ userId: user._id });
    const analyticsCount = await Analytics.countDocuments({ userId: user._id });
    const notifCount = await Notification.countDocuments({ userId: user._id });
    const eventCount = await CalendarEvent.countDocuments({ userId: user._id });
    const logCount = await ActionLog.countDocuments({ userId: user._id });
    const planCount = await StudyPlan.countDocuments({ userId: user._id });

    console.log("\n========== SEED COMPLETE ==========");
    console.log("Test Account:");
    console.log(`  Email:    ${TEST_USER.email}`);
    console.log(`  Password: ${TEST_USER.password}`);
    console.log("Records Created:");
    console.log(`  Users:         1`);
    console.log(`  Tasks:         ${taskCount}`);
    console.log(`  Subtasks:      ${subtaskCount}`);
    console.log(`  Goals:         ${goalCount}`);
    console.log(`  Analytics:     ${analyticsCount}`);
    console.log(`  Notifications: ${notifCount}`);
    console.log(`  Calendar Evts: ${eventCount}`);
    console.log(`  Action Logs:   ${logCount}`);
    console.log(`  Study Plans:   ${planCount}`);
    console.log("===================================\n");

    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
