const router = require("express").Router();
const analyticsController = require("../controllers/analytics.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/dashboard", analyticsController.getDashboardStats);
router.get("/", analyticsController.getAnalytics);

module.exports = router;
