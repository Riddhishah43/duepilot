const router = require("express").Router();
const aiController = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/analyze-task", aiController.analyzeTask);
router.post("/schedule", aiController.generateSchedule);
router.post("/rescue", aiController.rescueMode);
router.get("/daily-report", aiController.getDailyReport);
router.get("/weekly-report", aiController.getWeeklyReport);
router.post("/plan-goal", aiController.planGoal);
router.post("/generate-reminder", aiController.generateReminder);

module.exports = router;
