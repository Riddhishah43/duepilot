const router = require("express").Router();
const patternController = require("../controllers/pattern.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/insights", patternController.getInsights);

module.exports = router;
