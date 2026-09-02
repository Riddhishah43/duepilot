const mongoose = require("mongoose");
const User = require("../models/user.model");
const CalendarEvent = require("../models/calendarEvent.model");
const calendarController = require("../controllers/calendar.controller");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/calendar.service", () => ({
  getUserEvents: jest.fn().mockResolvedValue([]),
  getFreeSlots: jest.fn().mockResolvedValue([
    { start: "09:00", end: "10:00" },
    { start: "14:00", end: "15:00" },
  ]),
}));

const mockReqRes = (body = {}, params = {}, query = {}, user = null) => {
  const req = { body, params, query, user };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("Calendar Controller", () => {
  let userId;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = await User.create({ name: "CalUser", email: "caluser@ctrl.com", password: "pass123" });
    userId = testUser._id;
  });

  describe("getEvents", () => {
    it("returns events for user", async () => {
      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await calendarController.getEvents(req, res, next);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("createEvent", () => {
    it("creates a calendar event", async () => {
      const { req, res, next } = mockReqRes(
        { title: "Meeting", start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString() },
        {},
        {},
        testUser
      );

      await calendarController.createEvent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.event.title).toBe("Meeting");
    });
  });

  describe("updateEvent", () => {
    it("updates an event", async () => {
      const event = await CalendarEvent.create({
        userId,
        title: "Original",
        start: new Date(),
        end: new Date(Date.now() + 3600000),
      });

      const { req, res, next } = mockReqRes({ title: "Updated" }, { id: event._id }, {}, testUser);
      await calendarController.updateEvent(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.event.title).toBe("Updated");
    });

    it("returns 404 for non-existent event", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({ title: "X" }, { id: fakeId }, {}, testUser);
      await calendarController.updateEvent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteEvent", () => {
    it("deletes an event", async () => {
      const event = await CalendarEvent.create({
        userId,
        title: "Delete Me",
        start: new Date(),
        end: new Date(Date.now() + 3600000),
      });

      const { req, res, next } = mockReqRes({}, { id: event._id }, {}, testUser);
      await calendarController.deleteEvent(req, res, next);
      expect(await CalendarEvent.findById(event._id)).toBeNull();
    });

    it("returns 404 for non-existent event", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { id: fakeId }, {}, testUser);
      await calendarController.deleteEvent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getFreeSlots", () => {
    it("returns free slots", async () => {
      const { req, res, next } = mockReqRes({}, {}, { date: "2026-12-01" }, testUser);
      await calendarController.getFreeSlots(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.slots).toBeDefined();
    });
  });
});
