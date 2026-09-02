const mongoose = require("mongoose");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const Subtask = require("../models/subtask.model");
const taskController = require("../controllers/task.controller");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/groq.service", () => ({
  analyzeTaskBreakdown: jest.fn().mockResolvedValue({
    subtasks: [
      { title: "Step 1", duration: 30, suggestedOrder: 1 },
      { title: "Step 2", duration: 45, suggestedOrder: 2 },
    ],
  }),
  predictPriority: jest.fn().mockResolvedValue({ priority: "high", reason: "Deadline soon" }),
  analyzeRisk: jest.fn().mockResolvedValue({ riskScore: 75, reason: "Behind schedule" }),
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

describe("Task Controller", () => {
  let userId;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = await User.create({ name: "TaskUser", email: "taskuser@ctrl.com", password: "pass123" });
    userId = testUser._id;
  });

  describe("getTasks", () => {
    it("returns paginated tasks for user", async () => {
      await Task.create([
        { userId, title: "Task 1", deadline: new Date("2026-12-01") },
        { userId, title: "Task 2", deadline: new Date("2026-12-02") },
      ]);

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await taskController.getTasks(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.tasks.length).toBe(2);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(2);
    });

    it("filters by status", async () => {
      await Task.create([
        { userId, title: "Pending", deadline: new Date(), status: "pending" },
        { userId, title: "Done", deadline: new Date(), status: "completed" },
      ]);

      const { req, res, next } = mockReqRes({}, {}, { status: "pending" }, testUser);
      await taskController.getTasks(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.tasks.length).toBe(1);
      expect(data.tasks[0].title).toBe("Pending");
    });

    it("filters by search term", async () => {
      await Task.create([
        { userId, title: "Learn React", deadline: new Date() },
        { userId, title: "Learn Node", deadline: new Date() },
        { userId, title: "Build API", deadline: new Date() },
      ]);

      const { req, res, next } = mockReqRes({}, {}, { search: "React" }, testUser);
      await taskController.getTasks(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.tasks.length).toBe(1);
      expect(data.tasks[0].title).toBe("Learn React");
    });

    it("does not return tasks from other users", async () => {
      const otherUser = await User.create({ name: "Other", email: "other@ctrl.com", password: "pass123" });
      await Task.create({ userId: otherUser._id, title: "Other Task", deadline: new Date() });
      await Task.create({ userId, title: "My Task", deadline: new Date() });

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await taskController.getTasks(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.tasks.length).toBe(1);
      expect(data.tasks[0].title).toBe("My Task");
    });
  });

  describe("getTask", () => {
    it("returns a single task with subtasks", async () => {
      const task = await Task.create({ userId, title: "Single Task", deadline: new Date() });
      await Subtask.create({ taskId: task._id, title: "Sub 1", duration: 30, suggestedOrder: 1 });

      const { req, res, next } = mockReqRes({}, { id: task._id }, {}, testUser);
      await taskController.getTask(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.task.title).toBe("Single Task");
      expect(data.subtasks.length).toBe(1);
    });

    it("returns 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { id: fakeId }, {}, testUser);
      await taskController.getTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 404 for task belonging to another user", async () => {
      const otherUser = await User.create({ name: "Other", email: "other2@ctrl.com", password: "pass123" });
      const task = await Task.create({ userId: otherUser._id, title: "Their Task", deadline: new Date() });

      const { req, res, next } = mockReqRes({}, { id: task._id }, {}, testUser);
      await taskController.getTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createTask", () => {
    it("creates a task", async () => {
      const { req, res, next } = mockReqRes(
        { title: "New Task", deadline: "2026-12-31T23:59:59Z", priority: "high", estimatedDuration: 30 },
        {},
        {},
        testUser
      );
      req.validationResult = () => ({ isEmpty: () => true });

      await taskController.createTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.task.title).toBe("New Task");
    });

    it("triggers AI breakdown for long tasks (>=120 min)", async () => {
      const groqService = require("../services/groq.service");
      const { req, res, next } = mockReqRes(
        { title: "Big Task", deadline: "2026-12-31T23:59:59Z", estimatedDuration: 150 },
        {},
        {},
        testUser
      );
      req.validationResult = () => ({ isEmpty: () => true });

      await taskController.createTask(req, res, next);
      expect(groqService.analyzeTaskBreakdown).toHaveBeenCalled();
      const data = res.json.mock.calls[0][0];
      expect(data.subtasks.length).toBe(2);
    });

  });

  describe("updateTask", () => {
    it("updates allowed fields", async () => {
      const task = await Task.create({ userId, title: "Original", deadline: new Date() });
      const { req, res, next } = mockReqRes({ title: "Updated" }, { id: task._id }, {}, testUser);

      await taskController.updateTask(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.task.title).toBe("Updated");
    });

    it("returns 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({ title: "X" }, { id: fakeId }, {}, testUser);
      await taskController.updateTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("sets completedAt when status changes to completed", async () => {
      const task = await Task.create({ userId, title: "Complete Me", deadline: new Date() });
      const { req, res, next } = mockReqRes({ status: "completed" }, { id: task._id }, {}, testUser);

      await taskController.updateTask(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.task.status).toBe("completed");
      expect(data.task.completedAt).toBeDefined();
      expect(data.task.progress).toBe(100);
    });
  });

  describe("deleteTask", () => {
    it("deletes task and its subtasks", async () => {
      const task = await Task.create({ userId, title: "Delete Me", deadline: new Date() });
      await Subtask.create({ taskId: task._id, title: "Sub", duration: 10, suggestedOrder: 1 });

      const { req, res, next } = mockReqRes({}, { id: task._id }, {}, testUser);
      await taskController.deleteTask(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(await Task.findById(task._id)).toBeNull();
      expect(await Subtask.find({ taskId: task._id })).toHaveLength(0);
    });

    it("returns 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { id: fakeId }, {}, testUser);
      await taskController.deleteTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("archiveTask", () => {
    it("archives a task", async () => {
      const task = await Task.create({ userId, title: "Archive Me", deadline: new Date() });
      const { req, res, next } = mockReqRes({}, { id: task._id }, {}, testUser);

      await taskController.archiveTask(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.task.isArchived).toBe(true);
    });

    it("returns 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { id: fakeId }, {}, testUser);
      await taskController.archiveTask(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
