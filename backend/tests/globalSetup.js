const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function () {
  const mongoServer = await MongoMemoryServer.create({
    instance: { port: 0 },
    binary: { downloadDir: process.env.USERPROFILE + "/mongodb-binaries" },
    timeout: 60000,
  });
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = "test_jwt_secret_for_unit_tests_2026";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.GROQ_API_KEY = "test_key_mock";
  process.env.CLIENT_URL = "http://localhost:5173";
  globalThis.__MONGO_SERVER__ = mongoServer;
};
