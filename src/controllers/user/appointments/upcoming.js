"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const { getUpcomingAppointments } = require("@src/services/appointmentsService");

const CONTROLLER = [
  // verifyAuth(),
  validate({
    query: Joi.object({
      days: Joi.number().integer().min(1).max(30).optional(),
    }),
  }),

  async function upcomingAppointmentsController(req, res) {
    try {
      const { days } = req.query;
      const items = await getUpcomingAppointments({ days });

      return res.json({
        success: true,
        message: "Upcoming appointments fetched successfully",
        data: { items },
      });
    } catch (err) {
      console.error("Upcoming appointments error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming appointments",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/appointments/upcoming:
 *   get:
 *     tags: [Appointments]
 *     summary: List upcoming appointments (used in "Upcoming 7 Days" cards)
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           example: 7
 *         required: false
 *         description: Number of days from today to include. Defaults to 7.
 *     responses:
 *       200:
 *         description: Upcoming appointments fetched successfully
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
 *                   example: Upcoming appointments fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AppointmentWithLead'
 *       500:
 *         description: Failed to fetch upcoming appointments
 */
