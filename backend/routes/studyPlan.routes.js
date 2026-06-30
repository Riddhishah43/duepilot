const router = require("express").Router();
const studyPlanController = require("../controllers/studyPlan.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", studyPlanController.createPlan);
router.get("/", studyPlanController.getPlans);
router.get("/:id", studyPlanController.getPlan);
router.post("/:id/regenerate", studyPlanController.regeneratePlan);
router.delete("/:id", studyPlanController.deletePlan);

module.exports = router;
