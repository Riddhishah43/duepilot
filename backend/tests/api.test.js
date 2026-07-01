const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test_jwt_secret_2026";
process.env.GROQ_API_KEY = "test_key_for_ci";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/duepilot_test";
process.env.CLIENT_URL = "http://localhost:5173";

const mongoose = require("mongoose");
const app = require("../app");

let server;
let testToken;
let testUserId;

async function request(method, path, body, token) {
  const http = require("http");
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 0,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe("API Tests", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.db?.dropDatabase();
    server = app.listen(0, () => {
      const port = server.address().port;
      process.env.TEST_PORT = port;
    });
  });

  after(async () => {
    server?.close();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it("GET /api/health returns ok", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, "ok");
  });

  it("POST /api/auth/register creates user", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email: "test@test.com", password: "password123" }),
    });
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.ok(body.token);
    assert.equal(body.user.email, "test@test.com");
    testToken = body.token;
    testUserId = body.user._id;
  });

  it("POST /api/auth/login with valid credentials", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "password123" }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.token);
  });

  it("POST /api/auth/login with invalid password returns 401", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "wrongpassword" }),
    });
    assert.equal(res.status, 401);
  });

  it("GET /api/auth/profile requires token", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/auth/profile`);
    assert.equal(res.status, 401);
  });

  it("GET /api/auth/profile returns user with token", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.user.email, "test@test.com");
  });

  it("POST /api/tasks creates task with AI analysis", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ title: "Test Task", deadline: "2026-12-31T23:59:59Z", priority: "high", estimatedDuration: 30 }),
    });
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.task.title, "Test Task");
  });

  it("GET /api/tasks returns user tasks", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/tasks`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.tasks));
    assert.ok(body.tasks.length > 0);
  });

  it("GET /api/analytics/dashboard returns stats", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.notEqual(body.productivityScore, undefined);
  });

  it("POST /api/auth/forgot-password returns success", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com" }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.message.includes("sent"));
  });

  it("GET /api/notifications returns empty list for new user", async () => {
    const port = server.address().port;
    const res = await fetch(`http://localhost:${port}/api/notifications`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.notifications));
  });
});
