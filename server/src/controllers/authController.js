
const authService = require("../services/authService");

const register = async (req, res) => {
  const result = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: result,
  });
};

const login = async (req, res) => {
  const result = await authService.loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
