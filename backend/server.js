require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
