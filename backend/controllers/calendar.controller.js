const CalendarEvent = require("../models/calendarEvent.model");
const calendarService = require("../services/calendar.service");

exports.getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);

    const events = await calendarService.getUserEvents(req.user._id, start, end);
    res.json({ events });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, start, end, taskId } = req.body;
    const event = await CalendarEvent.create({
      userId: req.user._id,
      title,
      start,
      end,
      taskId: taskId || undefined,
      isWorkSession: !!taskId,
    });
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getFreeSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const slots = await calendarService.getFreeSlots(req.user._id, targetDate);
    res.json({ slots });
  } catch (error) {
    next(error);
  }
};
