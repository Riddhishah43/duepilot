const CalendarEvent = require("../models/calendarEvent.model");

async function getFreeSlots(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const events = await CalendarEvent.find({
    userId,
    start: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ start: 1 });

  const freeSlots = [];
  let currentStart = new Date(startOfDay);
  currentStart.setHours(6, 0, 0, 0);

  for (const event of events) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    if (currentStart < eventStart) {
      const durationMinutes = (eventStart - currentStart) / 60000;
      if (durationMinutes >= 30) {
        freeSlots.push({ start: new Date(currentStart), end: new Date(eventStart), duration: durationMinutes });
      }
    }
    if (eventEnd > currentStart) {
      currentStart = new Date(Math.max(currentStart, eventEnd));
    }
  }

  const endBoundary = new Date(startOfDay);
  endBoundary.setHours(23, 0, 0, 0);
  if (currentStart < endBoundary) {
    const durationMinutes = (endBoundary - currentStart) / 60000;
    if (durationMinutes >= 30) {
      freeSlots.push({ start: new Date(currentStart), end: new Date(endBoundary), duration: durationMinutes });
    }
  }

  return freeSlots;
}

async function createWorkSession(userId, taskId, title, start, end) {
  return CalendarEvent.create({
    userId,
    taskId,
    title,
    start,
    end,
    isWorkSession: true,
  });
}

async function getUserEvents(userId, startDate, endDate) {
  return CalendarEvent.find({
    userId,
    start: { $gte: startDate },
    end: { $lte: endDate },
  }).sort({ start: 1 });
}

module.exports = { getFreeSlots, createWorkSession, getUserEvents };
