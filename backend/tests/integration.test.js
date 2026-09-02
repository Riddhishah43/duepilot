const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/groq.service", () => ({
  analyzeTaskBreakdown: jest.fn().mockResolvedValue({
    subtasks: [{ title: "Step 1", duration: 30, suggestedOrder: 1 }],
  }),
  predictPriority: jest.fn().mockResolvedValue({ priority: "high", reason: "Soon" }),
  analyzeRisk: jest.fn().mockResolvedValue({ riskScore: 80, reason: "Behind" }),
  createSmartSchedule: jest.fn().mockResolvedValue({ sessions: [], warnings: [] }),
  createRescuePlan: jest.fn().mockResolvedValue({
    overview: { totalTasks: 1, crisisLevel: "medium" },
    categories: { critical: [], important: [], optional: [] },
    schedule: [],
    urgentActions: ["Start now"],
  }),
  generateDailyReport: jest.fn().mockResolvedValue({ score: 85, suggestions: [] }),
  generateWeeklyReport: jest.fn().mockResolvedValue({ averageScore: 80, trend: "up" }),
  planGoalMilestone: jest.fn().mockResolvedValue({ nextMilestone: { title: "Step 1" } }),
  generateSmartReminder: jest.fn().mockResolvedValue({ title: "Reminder", message: "Do it", type: "reminder" }),
  generateStudyPlan: jest.fn().mockResolvedValue({ schedule: [], stats: {}, tips: [] }),
  generateSmartNotifications: jest.fn().mockResolvedValue({ notifications: [] }),
  analyzePatterns: jest.fn().mockResolvedValue({ patterns: [] }),
}));

jest.mock("../services/calendar.service", () => ({
  getUserEvents: jest.fn().mockResolvedValue([]),
  getFreeSlots: jest.fn().mockResolvedValue([{ start: "09:00", end: "10:00" }]),
}));

jest.mock("../services/email.service", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("../services/smartNotification.service", () => ({
  generateAndSaveSmartNotifications: jest.fn().mockResolvedValue([]),
  getSmartNotifications: jest.fn().mockResolvedValue({ notifications: [] }),
}));

jest.mock("../services/pattern.service", () => ({
  logAction: jest.fn(),
  getPatternInsights: jest.fn().mockResolvedValue({ patterns: [], summary: "No patterns" }),
}));

jest.mock("../services/analytics.service", () => ({
  getAnalyticsInRange: jest.fn().mockResolvedValue([]),
  getOrCreateDailyAnalytics: jest.fn().mockResolvedValue({ productivityScore: 75 }),
  computeAggregates: jest.fn().mockResolvedValue({ completedTasks: 10, missedTasks: 2 }),
  computeStreak: jest.fn().mockResolvedValue(5),
}));

describe("API Integration Tests", () => {
  let authToken;

  beforeAll(async () => {
    await connectTestDB();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Integration User", email: "integration@test.com", password: "password123" });
    authToken = res.body.token;
  });

  beforeEach(async () => {
    await clearDatabase();
    // Re-create the test user for each test
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Integration User", email: "integration@test.com", password: "password123" });
    authToken = res.body.token;
  });

  describe("Health Check", () => {
    it("GET /api/health returns ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("Authentication", () => {
    it("POST /api/auth/register creates user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "New User", email: "new@integration.com", password: "password123" });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it("POST /api/auth/register returns 400 for duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Dup", email: "integration@test.com", password: "password123" });
      expect(res.status).toBe(400);
    });

    it("POST /api/auth/login returns token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "integration@test.com", password: "password123" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("POST /api/auth/login returns 401 for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "integration@test.com", password: "wrong" });
      expect(res.status).toBe(401);
    });

    it("GET /api/auth/profile returns user", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("integration@test.com");
    });

    it("GET /api/auth/profile returns 401 without token", async () => {
      const res = await request(app).get("/api/auth/profile");
      expect(res.status).toBe(401);
    });
  });

  describe("Tasks", () => {
    it("POST /api/tasks creates task", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Integration Task", deadline: "2026-12-31T23:59:59Z", priority: "high" });
      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe("Integration Task");
    });

    it("GET /api/tasks returns tasks", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Task", deadline: "2026-12-31T23:59:59Z" });

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    it("PUT /api/tasks/:id updates task", async () => {
      const createRes = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Original", deadline: "2026-12-31T23:59:59Z" });

      const res = await request(app)
        .put(`/api/tasks/${createRes.body.task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" });
      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe("Updated");
    });

    it("DELETE /api/tasks/:id deletes task", async () => {
      const createRes = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Delete Me", deadline: "2026-12-31T23:59:59Z" });

      const res = await request(app)
        .delete(`/api/tasks/${createRes.body.task._id}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it("GET /api/tasks returns 401 without auth", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });
  });

  describe("Goals", () => {
    it("POST /api/goals creates goal", async () => {
      const res = await request(app)
        .post("/api/goals")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Learn Testing", deadline: "2026-12-31T23:59:59Z" });
      expect(res.status).toBe(201);
    });

    it("GET /api/goals returns goals", async () => {
      const res = await request(app)
        .get("/api/goals")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("Notifications", () => {
    it("GET /api/notifications returns notifications", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications).toBeDefined();
    });
  });

  describe("Analytics", () => {
    it("GET /api/analytics/dashboard returns stats", async () => {
      const res = await request(app)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it("GET /api/analytics returns analytics data", async () => {
      const res = await request(app)
        .get("/api/analytics")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });
});
