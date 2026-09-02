const mongoose = require("mongoose");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const Goal = require("../models/goal.model");
const aiController = require("../controllers/ai.controller");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/groq.service", () => ({
  analyzeTaskBreakdown: jest.fn().mockResolvedValue({
    subtasks: [{ title: "Step 1", duration: 30, suggestedOrder: 1 }],
  }),
  predictPriority: jest.fn().mockResolvedValue({ priority: "high", reason: "Soon" }),
  analyzeRisk: jest.fn().mockResolvedValue({ riskScore: 80, reason: "Behind" }),
  createSmartSchedule: jest.fn().mockResolvedValue({ sessions: [], warnings: [] }),
  createRescuePlan: jest.fn().mockResolvedValue({
    overview: { totalTasks: 2, crisisLevel: "high" },
    categories: { critical: [], important: [], optional: [] },
    schedule: [],
    urgentActions: ["Start now"],
  }),
  generateDailyReport: jest.fn().mockResolvedValue({ score: 85, suggestions: [] }),
  generateWeeklyReport: jest.fn().mockResolvedValue({ averageScore: 80, trend: "up" }),
  planGoalMilestone: jest.fn().mockResolvedValue({ nextMilestone: { title: "Step 1" } }),
  generateSmartReminder: jest.fn().mockResolvedValue({ title: "Reminder", message: "Do it" }),
}));

jest.mock("../services/calendar.service", () => ({
  getFreeSlots: jest.fn().mockResolvedValue([]),
}));

jest.mock("../services/pattern.service", () => ({
  logAction: jest.fn(),
}));

const mockReqRes = (body = {}, params = {}, query = {}, user = null) => {
  const req = { body, params, query, user };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("AI Controller", () => {
  let userId;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = await User.create({ name: "AIUser", email: "aiuser@ctrl.com", password: "pass123" });
    userId = testUser._id;
  });

  describe("analyzeTask", () => {
    it("analyzes a task and returns breakdown, priority, and risk", async () => {
      const task = await Task.create({ userId, title: "Analyze Me", deadline: new Date(), estimatedDuration: 120 });
      const { req, res, next } = mockReqRes({ taskId: task._id }, {}, {}, testUser);

      await aiController.analyzeTask(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.subtasks).toBeDefined();
      expect(data.priority).toBeDefined();
      expect(data.risk).toBeDefined();
    });

    it("returns 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({ taskId: fakeId }, {}, {}, testUser);
      await aiController.analyzeTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("generateSchedule", () => {
    it("generates a schedule", async () => {
      await Task.create({ userId, title: "Task 1", deadline: new Date(), priority: "high" });
      const { req, res, next } = mockReqRes({ date: "2026-12-01" }, {}, {}, testUser);

      await aiController.generateSchedule(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.schedule).toBeDefined();
    });
  });

  describe("rescueMode", () => {
    it("generates rescue plan for pending tasks", async () => {
      await Task.create([
        { userId, title: "Urgent Task", deadline: new Date(), priority: "high", estimatedDuration: 120 },
        { userId, title: "Another Task", deadline: new Date(), priority: "medium" },
      ]);

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await aiController.rescueMode(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.rescuePlan).toBeDefined();
      expect(data.totalTasks).toBe(2);
    });

    it("returns 404 when no pending tasks", async () => {
      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await aiController.rescueMode(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getDailyReport", () => {
    it("generates daily report", async () => {
      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await aiController.getDailyReport(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.report).toBeDefined();
    });
  });

  describe("getWeeklyReport", () => {
    it("generates weekly report", async () => {
      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await aiController.getWeeklyReport(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.report).toBeDefined();
    });
  });

  describe("planGoal", () => {
    it("plans goal milestones", async () => {
      const goal = await Goal.create({ userId, title: "Learn React", deadline: new Date("2026-12-31") });
      const { req, res, next } = mockReqRes({ goalId: goal._id }, {}, {}, testUser);

      await aiController.planGoal(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.plan).toBeDefined();
    });

    it("returns 404 for non-existent goal", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({ goalId: fakeId }, {}, {}, testUser);
      await aiController.planGoal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("generateReminder", () => {
    it("generates a smart reminder", async () => {
      const task = await Task.create({ userId, title: "Remind Me", deadline: new Date() });
      const { req, res, next } = mockReqRes({ taskId: task._id }, {}, {}, testUser);

      await aiController.generateReminder(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.reminder).toBeDefined();
    });

    it("returns 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({ taskId: fakeId }, {}, {}, testUser);
      await aiController.generateReminder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
