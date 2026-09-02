const errorHandler = require("../middleware/error.middleware");

describe("error.middleware - errorHandler", () => {
  let req, res, next;
  let consoleSpy;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("handles Mongoose ValidationError", () => {
    const err = new Error("Validation failed");
    err.name = "ValidationError";
    err.errors = {
      title: { message: "Title is required" },
      email: { message: "Invalid email" },
    };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Title is required", "Invalid email"],
    });
  });

  it("handles duplicate key error (code 11000)", () => {
    const err = new Error("Duplicate key");
    err.code = 11000;
    err.keyValue = { email: "test@test.com" };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "email already exists" });
  });

  it("handles CastError (invalid ObjectId)", () => {
    const err = new Error("Cast error");
    err.name = "CastError";
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid ID format" });
  });

  it("handles error with custom statusCode", () => {
    const err = new Error("Not found");
    err.statusCode = 404;
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
  });

  it("handles generic error with 500 status", () => {
    const err = new Error("Something went wrong");
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });

  it("handles error without message", () => {
    const err = new Error();
    err.statusCode = 500;
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
