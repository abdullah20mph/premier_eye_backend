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
    }).min(1), // at least 1 field required
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

      // Unique email constraint
      if (err.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
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
 *     summary: Update profile information (display name, email)
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error or email already used
 *       401:
 *         description: Unauthorized
 */
