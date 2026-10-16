const mongoose = require("mongoose");

const getHealth = (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  const status = databaseConnected ? "ok" : "unavailable";

  return res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    status,
    message: databaseConnected
      ? "API and database are healthy"
      : "Database connection is unavailable",
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };