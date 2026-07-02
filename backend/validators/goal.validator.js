const { body } = require("express-validator");

const createGoalValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("deadline").isISO8601().withMessage("Valid deadline date is required"),
  body("category").optional().isIn(["personal", "career", "education", "health", "finance"]),
];

module.exports = { createGoalValidation };
