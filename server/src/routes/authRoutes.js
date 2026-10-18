
const express = require("express");

const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidator");

const validateRequest = require("../middleware/validateRequest");
const authenticate = require("../middleware/authenticate");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  register
);

router.post(
  "/login",
  validateRequest(loginSchema),
  login
);

router.get("/me", authenticate, getCurrentUser);

module.exports = router;
