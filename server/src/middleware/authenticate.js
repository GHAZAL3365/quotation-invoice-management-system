
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "ultrakey-invoice-api",
      audience: "ultrakey-invoice-app",
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const user = await User.findOne({
    _id: decoded.sub,
    isActive: true,
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User account is unavailable",
    });
  }

  req.user = user;

  return next();
};

module.exports = authenticate;
