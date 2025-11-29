"use strict";

const { verifyAuth } = require("@src/middleware");
const { getUserProfile } = require("@src/services/userProfileService");

const CONTROLLER = [
  // verifyAuth(),

  async function getProfileController(req, res) {
    try {
      const userId = 1;
      const profile = await getUserProfile(userId);

      return res.json({
        success: true,
        message: "Profile fetched successfully",
        data: profile,
      });
    } catch (err) {
      console.error("Get profile error:", err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch profile",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/settings/profile:
 *   get:
 *     tags: [Settings]
 *     summary: Get current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
