const { Signup, Login, Logout } = require("../Controllers/AuthController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout);

// Verify if user is authenticated (used by dashboard + frontend)
router.get("/verify", userVerification);

module.exports = router;
