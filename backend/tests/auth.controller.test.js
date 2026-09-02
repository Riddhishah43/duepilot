const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const authController = require("../controllers/auth.controller");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/email.service", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
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

describe("Auth Controller", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("register", () => {
    it("creates a new user and returns token", async () => {
      const { req, res, next } = mockReqRes({
        name: "New User",
        email: "new@auth.com",
        password: "password123",
      });
      req.validationResult = () => ({ isEmpty: () => true });

      await authController.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("new@auth.com");
      // Mock captures raw Mongoose doc; toJSON() strips password
      const userJson = data.user.toJSON ? data.user.toJSON() : data.user;
      expect(userJson.password).toBeUndefined();
    });

    it("returns 400 for duplicate email", async () => {
      await User.create({ name: "Existing", email: "dup@auth.com", password: "pass123" });
      const { req, res, next } = mockReqRes({
        name: "Another",
        email: "dup@auth.com",
        password: "pass123",
      });
      req.validationResult = () => ({ isEmpty: () => true });

      await authController.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await User.create({ name: "LoginUser", email: "login@auth.com", password: "password123" });
    });

    it("returns token for valid credentials", async () => {
      const { req, res, next } = mockReqRes({
        email: "login@auth.com",
        password: "password123",
      });
      req.validationResult = () => ({ isEmpty: () => true });

      await authController.login(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("login@auth.com");
    });

    it("returns 401 for wrong password", async () => {
      const { req, res, next } = mockReqRes({
        email: "login@auth.com",
        password: "wrongpassword",
      });
      req.validationResult = () => ({ isEmpty: () => true });

      await authController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 401 for non-existent email", async () => {
      const { req, res, next } = mockReqRes({
        email: "nonexistent@auth.com",
        password: "password123",
      });
      req.validationResult = () => ({ isEmpty: () => true });

      await authController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getProfile", () => {
    it("returns the authenticated user", async () => {
      const user = await User.create({ name: "Profile", email: "profile@auth.com", password: "pass123" });
      const { req, res, next } = mockReqRes({}, {}, user);

      await authController.getProfile(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.user.email).toBe("profile@auth.com");
    });
  });

  describe("forgotPassword", () => {
    it("returns success for existing email", async () => {
      await User.create({ name: "Forgot", email: "forgot@auth.com", password: "pass123" });
      const { req, res, next } = mockReqRes({ email: "forgot@auth.com" });

      await authController.forgotPassword(req, res, next);
      expect(res.json).toHaveBeenCalled();
      const data = res.json.mock.calls[0][0];
      expect(data.message).toContain("sent");
    });

    it("returns 404 for non-existent email", async () => {
      const { req, res, next } = mockReqRes({ email: "noone@auth.com" });

      await authController.forgotPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("resetPassword", () => {
    it("resets password with valid token", async () => {
      const user = await User.create({ name: "Reset", email: "reset@auth.com", password: "oldpass123" });
      const token = jwt.sign({ id: user._id, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "1h" });

      const { req, res, next } = mockReqRes({ token, password: "newpass123" });
      await authController.resetPassword(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const data = res.json.mock.calls[0][0];
      expect(data.message).toContain("successful");

      const updatedUser = await User.findById(user._id);
      expect(await updatedUser.comparePassword("newpass123")).toBe(true);
    });

    it("rejects token with wrong purpose", async () => {
      const user = await User.create({ name: "Reset2", email: "reset2@auth.com", password: "pass123" });
      const token = jwt.sign({ id: user._id, purpose: "auth" }, process.env.JWT_SECRET);

      const { req, res, next } = mockReqRes({ token, password: "newpass" });
      await authController.resetPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateProfile", () => {
    it("updates allowed fields", async () => {
      const user = await User.create({ name: "Updater", email: "update@auth.com", password: "pass123" });
      const { req, res, next } = mockReqRes({ name: "Updated Name", bio: "New bio" }, {}, user);

      await authController.updateProfile(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.user.name).toBe("Updated Name");
      expect(data.user.bio).toBe("New bio");
    });

    it("ignores disallowed fields", async () => {
      const user = await User.create({ name: "Ignore", email: "ignore@auth.com", password: "pass123" });
      const { req, res, next } = mockReqRes({ email: "hacker@evil.com", role: "admin" }, {}, user);

      await authController.updateProfile(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.user.email).toBe("ignore@auth.com");
    });
  });

  describe("deleteAccount", () => {
    it("deletes user and all associated data", async () => {
      const user = await User.create({ name: "Deleter", email: "delete@auth.com", password: "pass123" });
      const { req, res, next } = mockReqRes({}, {}, user);

      await authController.deleteAccount(req, res, next);
      expect(res.json).toHaveBeenCalled();

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });
});
