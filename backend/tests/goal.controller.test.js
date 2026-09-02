const mongoose = require("mongoose");
const User = require("../models/user.model");
const Goal = require("../models/goal.model");
const goalController = require("../controllers/goal.controller");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/groq.service", () => ({
  planGoalMilestone: jest.fn().mockResolvedValue({
    nextMilestone: { title: "Step 1", deadline: "2026-06-01", estimatedDuration: 30 },
  }),
}));

const mockReqRes = (body = {}, params = {}, user = null) => {
  const req = { body, params, user };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("Goal Controller", () => {
  let userId;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = await User.create({ name: "GoalUser", email: "goaluser@ctrl.com", password: "pass123" });
    userId = testUser._id;
  });

  describe("getGoals", () => {
    it("returns goals for user", async () => {
      await Goal.create([
        { userId, title: "Goal 1", deadline: new Date("2026-12-01") },
        { userId, title: "Goal 2", deadline: new Date("2026-12-02") },
      ]);

      const { req, res, next } = mockReqRes({}, {}, testUser);
      await goalController.getGoals(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.goals.length).toBe(2);
    });

    it("excludes archived goals", async () => {
      await Goal.create([
        { userId, title: "Active", deadline: new Date() },
        { userId, title: "Archived", deadline: new Date(), status: "archived" },
      ]);

      const { req, res, next } = mockReqRes({}, {}, testUser);
      await goalController.getGoals(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.goals.length).toBe(1);
    });
  });

  describe("createGoal", () => {
    it("creates a goal", async () => {
      const { req, res, next } = mockReqRes(
        { title: "Learn React", deadline: "2026-12-31T23:59:59Z" },
        {},
        testUser
      );

      await goalController.createGoal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.goal.title).toBe("Learn React");
    });
  });

  describe("updateGoal", () => {
    it("updates a goal", async () => {
      const goal = await Goal.create({ userId, title: "Original", deadline: new Date() });
      const { req, res, next } = mockReqRes({ title: "Updated" }, { id: goal._id }, testUser);

      await goalController.updateGoal(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.goal.title).toBe("Updated");
    });

    it("returns 404 for non-existent goal", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({ title: "X" }, { id: fakeId }, testUser);
      await goalController.updateGoal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteGoal", () => {
    it("deletes a goal", async () => {
      const goal = await Goal.create({ userId, title: "Delete Me", deadline: new Date() });
      const { req, res, next } = mockReqRes({}, { id: goal._id }, testUser);

      await goalController.deleteGoal(req, res, next);
      expect(res.json).toHaveBeenCalled();
      expect(await Goal.findById(goal._id)).toBeNull();
    });

    it("returns 404 for non-existent goal", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { id: fakeId }, testUser);
      await goalController.deleteGoal(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("toggleMilestone", () => {
    it("toggles milestone completion and updates progress", async () => {
      const goal = await Goal.create({
        userId,
        title: "Goal with milestones",
        deadline: new Date(),
        milestones: [
          { title: "M1", completed: false },
          { title: "M2", completed: false },
        ],
      });

      const milestoneId = goal.milestones[0]._id;
      const { req, res, next } = mockReqRes({}, { goalId: goal._id, milestoneId }, testUser);

      await goalController.toggleMilestone(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.goal.milestones[0].completed).toBe(true);
      expect(data.goal.progress).toBe(50);
    });

    it("returns 404 for non-existent goal", async () => {
      const fakeGoalId = new mongoose.Types.ObjectId();
      const fakeMilestoneId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { goalId: fakeGoalId, milestoneId: fakeMilestoneId }, testUser);
      await goalController.toggleMilestone(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 404 for non-existent milestone", async () => {
      const goal = await Goal.create({ userId, title: "G", deadline: new Date() });
      const fakeMilestoneId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { goalId: goal._id, milestoneId: fakeMilestoneId }, testUser);
      await goalController.toggleMilestone(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
