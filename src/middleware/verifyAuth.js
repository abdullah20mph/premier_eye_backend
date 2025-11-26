"use strict";

const jwt = require("jsonwebtoken");
const { response } = require("@src/utils");

function verifyAuth() {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return response.send(0, 401, "Access token missing", null, res, null);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return response.send(
        0,
        401,
        "Access token missing from Authorization header",
        null,
        res,
        null
      );
    }

    try {
      // 🔴 changed to JWT_SECRET so it matches login
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };

      return next();
    } catch (err) {
      const msg =
        err.name === "TokenExpiredError"
          ? "Unauthorized - Session Expired"
          : "Unauthorized: invalid or expired token";

      return response.send(0, 401, msg, null, res, err);
    }
  };
}

module.exports = verifyAuth;
