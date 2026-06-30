const router = require("express").Router();
const taskController = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");
const { createTaskValidation, updateTaskValidation } = require("../validators/task.validator");

router.use(protect);

router.get("/", taskController.getTasks);
router.get("/risky", taskController.getRiskyTasks);
router.get("/:id", taskController.getTask);
router.post("/", createTaskValidation, taskController.createTask);
router.put("/:id", updateTaskValidation, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.patch("/:id/archive", taskController.archiveTask);

module.exports = router;
