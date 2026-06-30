const { body } = require("express-validator");

const createTaskValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("deadline").isISO8601().withMessage("Valid deadline date is required"),
  body("estimatedDuration").optional().isInt({ min: 1 }).withMessage("Duration must be in minutes"),
];

const updateTaskValidation = [
  body("title").optional().trim().notEmpty(),
  body("deadline").optional().isISO8601(),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("status").optional().isIn(["pending", "in-progress", "completed", "missed"]),
  body("progress").optional().isInt({ min: 0, max: 100 }),
];

module.exports = { createTaskValidation, updateTaskValidation };
