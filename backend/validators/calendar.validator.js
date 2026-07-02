const { body } = require("express-validator");

const createEventValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("start").isISO8601().withMessage("Valid start date is required"),
  body("end").isISO8601().withMessage("Valid end date is required"),
];

module.exports = { createEventValidation };
