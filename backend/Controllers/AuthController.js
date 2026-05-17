const User = require("../model/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

module.exports.Login = async (req, res) => {
  try {
    // req.body is already validated & sanitized by Joi middleware
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,         // set true in production with HTTPS
      sameSite: "lax",       // allows cookie to be sent across ports on localhost
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in ms
      path: "/",
    });
    res.status(200).json({
      message: "Login successful",
      success: true,
      user: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports.Signup = async (req, res) => {
  try {
    // req.body is already validated & sanitized by Joi middleware
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }
    const user = await User.create({
      email,
      password, // pass plain password, let pre-save hook hash it
      username,
    });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res
      .status(201)
      .json({ message: "User signed up successfully", success: true, user: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports.Logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully", success: true });
};
