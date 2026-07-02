const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { registerValidation, loginValidation } = require("../validators/auth.validator");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, registerValidation, authController.register);
router.post("/login", authLimiter, loginValidation, authController.login);
router.post("/demo-login", authLimiter, authController.demoLogin);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);
router.delete("/account", protect, authController.deleteAccount);

module.exports = router;
