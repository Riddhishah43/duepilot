const router = require("express").Router();
const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", notificationController.getNotifications);
router.get("/important", notificationController.getImportantNotifications);
router.get("/smart", notificationController.getSmart);
router.post("/generate-deadline", notificationController.generateDeadlineNotifications);
router.post("/generate-smart", notificationController.generateSmart);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
