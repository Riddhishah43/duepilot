const router = require("express").Router();
const calendarController = require("../controllers/calendar.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", calendarController.getEvents);
router.get("/free-slots", calendarController.getFreeSlots);
router.post("/", calendarController.createEvent);
router.put("/:id", calendarController.updateEvent);
router.delete("/:id", calendarController.deleteEvent);

module.exports = router;
