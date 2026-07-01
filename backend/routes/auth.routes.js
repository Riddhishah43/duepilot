const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { registerValidation, loginValidation } = require("../validators/auth.validator");

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);
router.delete("/account", protect, authController.deleteAccount);

module.exports = router;
