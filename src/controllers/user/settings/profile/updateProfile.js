"use strict";

const Joi = require("joi");
const { verifyAuth, validate } = require("@src/middleware");
const { updateUserProfile } = require("@src/services/userProfileService");

const CONTROLLER = [
  verifyAuth(),
  validate({
    body: Joi.object({
      display_name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      username: Joi.string().min(3).max(50).optional(),
    }).min(1), // at least one field
  }),

  async function updateProfileController(req, res) {
    try {
      const userId = req.user.id;
      const profile = await updateUserProfile(userId, req.body);

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (err) {
      console.error("Update profile error:", err);

      // handle unique username violation nicely
      if (err.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "Username or email already in use",
        });
      }

      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to update profile",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/settings/profile:
 *   patch:
 *     tags: [Settings]
 *     summary: Update profile information (display name, email, username)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *                 example: Dr. Smith
 *               email:
 *                 type: string
 *                 example: dr.smith@agentum.ai
 *               username:
 *                 type: string
 *                 example: drsmith
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error or username/email already used
 *       401:
 *         description: Unauthorized
 */
