const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_for_unit_tests_2026";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || "test_key_mock";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

async function connectTestDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  // Wait until the connection is actually ready
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) return resolve();
    mongoose.connection.once("open", resolve);
  });
}

async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}

async function clearDatabase() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = { connectTestDB, disconnectTestDB, clearDatabase };
