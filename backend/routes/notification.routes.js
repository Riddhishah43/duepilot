const router = require("express").Router();
const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", notificationController.getNotifications);
router.get("/important", notificationController.getImportantNotifications);
router.post("/generate-deadline", notificationController.generateDeadlineNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);

module.exports = router;
