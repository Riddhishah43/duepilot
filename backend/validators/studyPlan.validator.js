const { body } = require("express-validator");

const createPlanValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("subjects").isArray({ min: 1 }).withMessage("At least one subject is required"),
  body("availableHoursPerDay").isInt({ min: 1, max: 24 }).withMessage("Available hours must be between 1-24"),
];

module.exports = { createPlanValidation };
