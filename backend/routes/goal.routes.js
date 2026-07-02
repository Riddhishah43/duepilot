const router = require("express").Router();
const goalController = require("../controllers/goal.controller");
const { protect } = require("../middleware/auth.middleware");
const { createGoalValidation } = require("../validators/goal.validator");

router.use(protect);

router.get("/", goalController.getGoals);
router.post("/", createGoalValidation, goalController.createGoal);
router.put("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);
router.patch("/:goalId/milestones/:milestoneId", goalController.toggleMilestone);

module.exports = router;
