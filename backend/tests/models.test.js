const mongoose = require("mongoose");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const Goal = require("../models/goal.model");
const Notification = require("../models/notification.model");
const Subtask = require("../models/subtask.model");
const Analytics = require("../models/analytics.model");
const CalendarEvent = require("../models/calendarEvent.model");
const ActionLog = require("../models/actionLog.model");
const { connectTestDB, clearDatabase } = require("./testHelper");

describe("User Model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it("creates a user with valid data", async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@model.com",
      password: "password123",
    });
    expect(user.name).toBe("Test User");
    expect(user.email).toBe("test@model.com");
    expect(user.password).not.toBe("password123");
  });

  it("hashes password on save", async () => {
    const user = await User.create({
      name: "Hash Test",
      email: "hash@model.com",
      password: "mypassword",
    });
    expect(user.password).toMatch(/^\$2[ab]\$/);
  });

  it("does not rehash password if not modified", async () => {
    const user = await User.create({
      name: "No Rehash",
      email: "norehash@model.com",
      password: "password123",
    });
    const originalHash = user.password;
    user.name = "Updated Name";
    await user.save();
    expect(user.password).toBe(originalHash);
  });

  it("compares password correctly", async () => {
    const user = await User.create({
      name: "Compare",
      email: "compare@model.com",
      password: "secret123",
    });
    expect(await user.comparePassword("secret123")).toBe(true);
    expect(await user.comparePassword("wrong")).toBe(false);
  });

  it("excludes password from JSON", async () => {
    const user = await User.create({
      name: "JSON Test",
      email: "json@model.com",
      password: "password123",
    });
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.name).toBe("JSON Test");
  });

  it("enforces unique email", async () => {
    await User.create({ name: "First", email: "dup@model.com", password: "pass123" });
    await expect(
      User.create({ name: "Second", email: "dup@model.com", password: "pass456" })
    ).rejects.toThrow();
  });

  it("requires name, email, password", async () => {
    await expect(User.create({})).rejects.toThrow();
    await expect(User.create({ name: "NoEmail" })).rejects.toThrow();
  });

  it("sets default values", async () => {
    const user = await User.create({
      name: "Defaults",
      email: "defaults@model.com",
      password: "password123",
    });
    expect(user.timezone).toBe("UTC");
    expect(user.productivityScore).toBe(0);
    expect(user.theme).toBe("light");
    expect(user.dailyGoal).toBe(3);
    expect(user.weeklyGoal).toBe(10);
  });
});

describe("Task Model", () => {
  let userId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create({ name: "TaskUser", email: "task@model.com", password: "pass123" });
    userId = user._id;
  });

  it("creates a task with valid data", async () => {
    const task = await Task.create({
      userId,
      title: "Test Task",
      deadline: new Date("2026-12-31"),
    });
    expect(task.title).toBe("Test Task");
    expect(task.status).toBe("pending");
    expect(task.priority).toBe("medium");
    expect(task.progress).toBe(0);
  });

  it("requires userId and title and deadline", async () => {
    await expect(Task.create({})).rejects.toThrow();
    await expect(Task.create({ userId })).rejects.toThrow();
  });

  it("enums for priority", async () => {
    const task = await Task.create({ userId, title: "T", deadline: new Date() });
    task.priority = "invalid";
    await expect(task.save()).rejects.toThrow();
  });

  it("enums for status", async () => {
    const task = await Task.create({ userId, title: "T", deadline: new Date() });
    task.status = "invalid";
    await expect(task.save()).rejects.toThrow();
  });

  it("clamps progress between 0 and 100", async () => {
    const task = await Task.create({ userId, title: "T", deadline: new Date() });
    task.progress = 150;
    await expect(task.save()).rejects.toThrow();
  });
});

describe("Goal Model", () => {
  let userId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create({ name: "GoalUser", email: "goal@model.com", password: "pass123" });
    userId = user._id;
  });

  it("creates a goal with valid data", async () => {
    const goal = await Goal.create({
      userId,
      title: "Learn React",
      deadline: new Date("2026-12-31"),
    });
    expect(goal.title).toBe("Learn React");
    expect(goal.progress).toBe(0);
    expect(goal.status).toBe("active");
  });

  it("supports milestones", async () => {
    const goal = await Goal.create({
      userId,
      title: "Learn React",
      deadline: new Date("2026-12-31"),
      milestones: [
        { title: "Complete tutorial", completed: true },
        { title: "Build project", completed: false },
      ],
    });
    expect(goal.milestones.length).toBe(2);
    expect(goal.milestones[0].completed).toBe(true);
  });
});

describe("Notification Model", () => {
  let userId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create({ name: "NotifUser", email: "notif@model.com", password: "pass123" });
    userId = user._id;
  });

  it("creates a notification with valid data", async () => {
    const notif = await Notification.create({
      userId,
      title: "Test",
      message: "Test message",
    });
    expect(notif.title).toBe("Test");
    expect(notif.read).toBe(false);
    expect(notif.type).toBe("reminder");
  });

  it("enforces valid type enum", async () => {
    await expect(
      Notification.create({ userId, title: "T", message: "M", type: "invalid" })
    ).rejects.toThrow();
  });
});

describe("Subtask Model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it("creates a subtask", async () => {
    const taskId = new mongoose.Types.ObjectId();
    const subtask = await Subtask.create({
      taskId,
      title: "Subtask 1",
      duration: 30,
      suggestedOrder: 1,
    });
    expect(subtask.title).toBe("Subtask 1");
    expect(subtask.completed).toBe(false);
  });
});

describe("CalendarEvent Model", () => {
  let userId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create({ name: "CalUser", email: "cal@model.com", password: "pass123" });
    userId = user._id;
  });

  it("creates a calendar event", async () => {
    const event = await CalendarEvent.create({
      userId,
      title: "Meeting",
      start: new Date(),
      end: new Date(Date.now() + 3600000),
    });
    expect(event.title).toBe("Meeting");
  });
});

describe("Analytics Model", () => {
  let userId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create({ name: "AnalyticsUser", email: "analytics@model.com", password: "pass123" });
    userId = user._id;
  });

  it("creates analytics entry", async () => {
    const analytics = await Analytics.create({
      userId,
      date: new Date(),
      productivityScore: 75,
      completedTasks: 5,
      missedTasks: 1,
      hoursWorked: 6,
    });
    expect(analytics.productivityScore).toBe(75);
  });
});

describe("ActionLog Model", () => {
  let userId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create({ name: "ActionUser", email: "action@model.com", password: "pass123" });
    userId = user._id;
  });

  it("creates an action log", async () => {
    const log = await ActionLog.create({
      userId,
      action: "task_created",
      taskTitle: "Test Task",
    });
    expect(log.action).toBe("task_created");
  });
});
