const router = require("express").Router();
const calendarController = require("../controllers/calendar.controller");
const { protect } = require("../middleware/auth.middleware");
const { createEventValidation } = require("../validators/calendar.validator");

router.use(protect);

router.get("/", calendarController.getEvents);
router.get("/free-slots", calendarController.getFreeSlots);
router.post("/", createEventValidation, calendarController.createEvent);
router.put("/:id", calendarController.updateEvent);
router.delete("/:id", calendarController.deleteEvent);

module.exports = router;
