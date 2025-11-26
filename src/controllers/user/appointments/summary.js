
// src/controllers/user/appointments/summary.js
"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const { getAppointmentsSummary } = require("@src/services/appointmentsService");

const CONTROLLER = [
  verifyAuth(),
  validate({ query: Joi.object({}) }),

  async function appointmentsSummaryController(req, res) {
    try {
      const summary = await getAppointmentsSummary();

      return res.json({
        success: true,
        message: "Appointments summary fetched successfully",
        data: summary,
      });
    } catch (err) {
      console.error("Appointments summary error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch appointments summary",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/appointments/summary:
 *   get:
 *     tags: [Appointments]
 *     summary: Get high-level appointments summary for tiles
 *     description: >
 *       Returns counts used for the Appointments overview tiles:
 *       Scheduled upcoming, Pending confirmation, No-shows (all time), and Completed (all time).
 *     responses:
 *       200:
 *         description: Summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Appointments summary fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     scheduledUpcoming:
 *                       type: integer
 *                       example: 2
 *                     pendingConfirmation:
 *                       type: integer
 *                       example: 3
 *                     noShowsAllTime:
 *                       type: integer
 *                       example: 0
 *                     completedAllTime:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Failed to fetch summary
 */

