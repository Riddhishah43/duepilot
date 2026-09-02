const mongoose = require("mongoose");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const notificationController = require("../controllers/notification.controller");
const { connectTestDB, clearDatabase } = require("./testHelper");

jest.mock("../services/groq.service", () => ({
  generateSmartReminder: jest.fn().mockResolvedValue({
    title: "Smart Reminder",
    message: "Time to work on your task",
    type: "reminder",
  }),
}));

jest.mock("../services/smartNotification.service", () => ({
  generateAndSaveSmartNotifications: jest.fn().mockResolvedValue([]),
  getSmartNotifications: jest.fn().mockResolvedValue({ notifications: [] }),
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

describe("Notification Controller", () => {
  let userId;
  let testUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = await User.create({ name: "NotifUser", email: "notifuser@ctrl.com", password: "pass123" });
    userId = testUser._id;
  });

  describe("getNotifications", () => {
    it("returns notifications for user", async () => {
      await Notification.create([
        { userId, title: "Notif 1", message: "Message 1" },
        { userId, title: "Notif 2", message: "Message 2" },
      ]);

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await notificationController.getNotifications(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.notifications.length).toBe(2);
      expect(data.unreadCount).toBe(2);
    });

    it("does not return other users' notifications", async () => {
      const other = await User.create({ name: "Other", email: "other@ctrl.com", password: "pass123" });
      await Notification.create({ userId: other._id, title: "Other Notif", message: "X" });
      await Notification.create({ userId, title: "My Notif", message: "Y" });

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await notificationController.getNotifications(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.notifications.length).toBe(1);
    });
  });

  describe("markAsRead", () => {
    it("marks a notification as read", async () => {
      const notif = await Notification.create({ userId, title: "Read Me", message: "X" });
      const { req, res, next } = mockReqRes({}, { id: notif._id }, {}, testUser);

      await notificationController.markAsRead(req, res, next);
      const data = res.json.mock.calls[0][0];
      expect(data.notification.read).toBe(true);
    });

    it("returns 404 for non-existent notification", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res, next } = mockReqRes({}, { id: fakeId }, {}, testUser);
      await notificationController.markAsRead(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      await Notification.create([
        { userId, title: "N1", message: "M1" },
        { userId, title: "N2", message: "M2" },
      ]);

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await notificationController.markAllAsRead(req, res, next);

      const unread = await Notification.countDocuments({ userId, read: false });
      expect(unread).toBe(0);
    });
  });

  describe("getImportantNotifications", () => {
    it("returns unread important notifications", async () => {
      await Notification.create([
        { userId, title: "Risk", message: "M", type: "risk_alert", read: false },
        { userId, title: "Deadline", message: "M", type: "deadline", read: false },
        { userId, title: "Read", message: "M", type: "risk_alert", read: true },
        { userId, title: "Reminder", message: "M", type: "reminder", read: false },
      ]);

      const { req, res, next } = mockReqRes({}, {}, {}, testUser);
      await notificationController.getImportantNotifications(req, res, next);

      const data = res.json.mock.calls[0][0];
      expect(data.notifications.length).toBe(2);
    });
  });
});
