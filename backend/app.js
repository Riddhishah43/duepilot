const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");


const analyticsRoutes = require("./routes/analytics.routes");
const aiRoutes = require("./routes/ai.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/study-plans", require("./routes/studyPlan.routes"));
app.use("/api/patterns", require("./routes/pattern.routes"));

app.use(errorHandler);

module.exports = app;
