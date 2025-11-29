"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const { getAppointmentsInRange } = require("@src/services/appointmentsService");

const CONTROLLER = [
  // verifyAuth(),
  validate({
    query: Joi.object({
      start: Joi.string().isoDate().required(),
      end: Joi.string().isoDate().required(),
    }),
  }),

  async function appointmentsRangeController(req, res) {
    try {
      const { start, end } = req.query;
      const items = await getAppointmentsInRange({ start, end });

      return res.json({
        success: true,
        message: "Appointments for range fetched successfully",
        data: { items },
      });
    } catch (err) {
      console.error("Appointments range error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch appointments for range",
      });
    }
  },
];

module.exports = CONTROLLER;


/**
 * @swagger
 * /user/appointments/range:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointments in a date range (calendar month/week view)
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-11-01T00:00:00.000Z"
 *         required: true
 *         description: Start of the range (inclusive) in ISO 8601 format.
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-11-30T23:59:59.000Z"
 *         required: true
 *         description: End of the range (inclusive) in ISO 8601 format.
 *     responses:
 *       200:
 *         description: Appointments for the range
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
 *                   example: Appointments for range fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AppointmentWithLead'
 *       500:
 *         description: Failed to fetch appointments
 */