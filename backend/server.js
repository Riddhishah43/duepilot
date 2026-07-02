require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", { message: err.message, stack: err.stack });
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
  process.exit(1);
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to database, shutting down", { message: err.message });
    process.exit(1);
  });
