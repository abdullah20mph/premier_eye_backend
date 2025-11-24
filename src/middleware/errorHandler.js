
"use strict";

module.exports = (err, req, res, next) => {
  console.error("🔥 Error Handler:", err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
