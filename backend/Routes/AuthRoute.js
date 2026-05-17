const { Signup, Login, Logout } = require("../Controllers/AuthController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const {
  validate,
  signupSchema,
  loginSchema,
} = require("../Middlewares/validation");
const router = require("express").Router();

// Auth routes with Joi validation middleware
router.post("/signup", validate(signupSchema), Signup);
router.post("/login", validate(loginSchema), Login);
router.post("/logout", Logout);

// Verify if user is authenticated (used by dashboard + frontend)
router.get("/verify", userVerification);

module.exports = router;
