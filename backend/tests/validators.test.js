const { validationResult } = require("express-validator");
const { registerValidation, loginValidation } = require("../validators/auth.validator");
const { createTaskValidation, updateTaskValidation } = require("../validators/task.validator");

const runValidation = async (validations, body) => {
  const req = { body };
  const res = {};
  for (const v of validations) {
    await v.run(req);
  }
  return validationResult(req);
};

describe("auth.validator", () => {
  describe("registerValidation", () => {
    it("passes with valid data", async () => {
      const result = await runValidation(registerValidation, {
        name: "John Doe",
        email: "john@test.com",
        password: "password123",
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails without name", async () => {
      const result = await runValidation(registerValidation, {
        email: "john@test.com",
        password: "password123",
      });
      expect(result.isEmpty()).toBe(false);
      expect(result.array().some((e) => e.path === "name")).toBe(true);
    });

    it("fails with invalid email", async () => {
      const result = await runValidation(registerValidation, {
        name: "John",
        email: "not-an-email",
        password: "password123",
      });
      expect(result.isEmpty()).toBe(false);
      expect(result.array().some((e) => e.path === "email")).toBe(true);
    });

    it("fails with short password", async () => {
      const result = await runValidation(registerValidation, {
        name: "John",
        email: "john@test.com",
        password: "123",
      });
      expect(result.isEmpty()).toBe(false);
      expect(result.array().some((e) => e.path === "password")).toBe(true);
    });
  });

  describe("loginValidation", () => {
    it("passes with valid data", async () => {
      const result = await runValidation(loginValidation, {
        email: "john@test.com",
        password: "password123",
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails without email", async () => {
      const result = await runValidation(loginValidation, {
        password: "password123",
      });
      expect(result.isEmpty()).toBe(false);
    });

    it("fails without password", async () => {
      const result = await runValidation(loginValidation, {
        email: "john@test.com",
      });
      expect(result.isEmpty()).toBe(false);
    });
  });
});

describe("task.validator", () => {
  describe("createTaskValidation", () => {
    it("passes with valid data", async () => {
      const result = await runValidation(createTaskValidation, {
        title: "Test Task",
        deadline: "2026-12-31T23:59:59Z",
        estimatedDuration: 60,
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails without title", async () => {
      const result = await runValidation(createTaskValidation, {
        deadline: "2026-12-31T23:59:59Z",
      });
      expect(result.isEmpty()).toBe(false);
      expect(result.array().some((e) => e.path === "title")).toBe(true);
    });

    it("fails without deadline", async () => {
      const result = await runValidation(createTaskValidation, {
        title: "Test Task",
      });
      expect(result.isEmpty()).toBe(false);
      expect(result.array().some((e) => e.path === "deadline")).toBe(true);
    });

    it("fails with invalid deadline format", async () => {
      const result = await runValidation(createTaskValidation, {
        title: "Test Task",
        deadline: "not-a-date",
      });
      expect(result.isEmpty()).toBe(false);
    });

    it("passes without estimatedDuration (optional)", async () => {
      const result = await runValidation(createTaskValidation, {
        title: "Test Task",
        deadline: "2026-12-31T23:59:59Z",
      });
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe("updateTaskValidation", () => {
    it("passes with valid priority", async () => {
      const result = await runValidation(updateTaskValidation, {
        priority: "high",
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails with invalid priority", async () => {
      const result = await runValidation(updateTaskValidation, {
        priority: "urgent",
      });
      expect(result.isEmpty()).toBe(false);
    });

    it("passes with valid status", async () => {
      const result = await runValidation(updateTaskValidation, {
        status: "in-progress",
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails with invalid status", async () => {
      const result = await runValidation(updateTaskValidation, {
        status: "done",
      });
      expect(result.isEmpty()).toBe(false);
    });

    it("passes with valid progress", async () => {
      const result = await runValidation(updateTaskValidation, {
        progress: 50,
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails with progress > 100", async () => {
      const result = await runValidation(updateTaskValidation, {
        progress: 150,
      });
      expect(result.isEmpty()).toBe(false);
    });
  });
});
