const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { protect } = require("../middleware/auth.middleware");
const User = require("../models/user.model");
const { connectTestDB, clearDatabase } = require("./testHelper");

describe("auth.middleware - protect", () => {
  let req, res, next;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    testUser = await User.create({
      name: "Test User",
      email: "test@middleware.com",
      password: "password123",
    });
  });

  it("returns 401 if no token provided", async () => {
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, no token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", async () => {
    req.headers.authorization = "Bearer invalid_token_here";
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, invalid token" });
  });

  it("returns 401 if user not found in DB", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: fakeId }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("calls next and sets req.user for valid token", async () => {
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;
    await protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe("test@middleware.com");
  });
});
