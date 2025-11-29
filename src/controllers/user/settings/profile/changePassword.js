"use strict";

const Joi = require("joi");
const { verifyAuth, validate } = require("@src/middleware");
const { changeUserPassword } = require("@src/services/userProfileService");

const CONTROLLER = [
  // verifyAuth(),
  validate({
    body: Joi.object({
      current_password: Joi.string().required(),
      new_password: Joi.string().min(8).required(),
    }),
  }),

  async function changePasswordController(req, res) {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;

      await changeUserPassword(userId, current_password, new_password);

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Change password error:", err);

      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to update password",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/settings/password:
 *   patch:
 *     tags: [Settings]
 *     summary: Change current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: oldPassword123
 *               new_password:
 *                 type: string
 *                 example: NewSecurePass!234
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Current password incorrect or validation error
 *       401:
 *         description: Unauthorized
 */
