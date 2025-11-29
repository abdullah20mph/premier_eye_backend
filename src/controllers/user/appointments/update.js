"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const { updateAppointment } = require("@src/services/appointmentsService");

const STATUS_VALUES = [
  "AI CALLED - NO ANSWER",
  "AI SPOKE TO LEAD",
  "SCHEDULED",
  "NEEDS VA TO FOLLOW UP",
  "APPOINTMENT BOOKED",
  "APPOINTMENT COMPLETED",
  "NO SHOW",
  "NOT INTERESTED",
];

const SERVICE_TYPES = [
  "LASIK CONSULTANT",
  "COMPREHENSIVE EYE EXAM",
  "CONTACT LENS FITTING",
  "DRY EYE TREATMENT",
];

const LOCATIONS = ["Plantation", "Boca Raton", "West Palm"];

const INSURANCE_PROVIDERS = [
  "VSP",
  "EyeMed",
  "Spectera",
  "Humana Vision",
  "Cigna",
  "UnitedHealthcare",
  "Other",
];

const CONTROLLER = [
  // verifyAuth(),
  validate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    body: Joi.object({
      // if you want to change personal info, you must know which lead
      lead_id: Joi.number().integer().optional(),

      scheduled_at: Joi.string().isoDate().optional(),

      status: Joi.string()
        .valid(...STATUS_VALUES)
        .optional(),

      service_type: Joi.string()
        .valid(...SERVICE_TYPES)
        .allow("", null)
        .optional(),

      expected_value: Joi.number().allow(null).optional(),
      notes: Joi.string().allow("", null).optional(),

      location: Joi.string()
        .valid(...LOCATIONS)
        .allow("", null)
        .optional(),

      dob: Joi.string().allow("", null).optional(),

      insurance: Joi.string()
        .valid(...INSURANCE_PROVIDERS)
        .allow("", null)
        .optional(),
    }),
  }),

  async function updateAppointmentController(req, res) {
    try {
      const id = Number(req.params.id);
      const appt = await updateAppointment(id, req.body);

      return res.json({
        success: true,
        message: "Appointment updated successfully",
        data: appt,
      });
    } catch (err) {
      console.error("Update appointment error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update appointment",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/appointments/{id}:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update an existing appointment (and/or lead personal info)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lead_id:
 *                 type: integer
 *                 description: Required if you want to change personal info
 *                 example: 12
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-28T15:00:00.000Z"
 *               status:
 *                 type: string
 *                 enum:
 *                   - AI CALLED - NO ANSWER
 *                   - AI SPOKE TO LEAD
 *                   - SCHEDULED
 *                   - NEEDS VA TO FOLLOW UP
 *                   - APPOINTMENT BOOKED
 *                   - APPOINTMENT COMPLETED
 *                   - NO SHOW
 *                   - NOT INTERESTED
 *               service_type:
 *                 type: string
 *                 enum:
 *                   - LASIK CONSULTANT
 *                   - COMPREHENSIVE EYE EXAM
 *                   - CONTACT LENS FITTING
 *                   - DRY EYE TREATMENT
 *               expected_value:
 *                 type: number
 *                 example: 2500
 *               notes:
 *                 type: string
 *                 example: "Patient completed procedure and paid in full."
 *               location:
 *                 type: string
 *                 enum: [Plantation, Boca Raton, West Palm]
 *               dob:
 *                 type: string
 *                 example: "1965-02-20"
 *               insurance:
 *                 type: string
 *                 enum:
 *                   - VSP
 *                   - EyeMed
 *                   - Spectera
 *                   - Humana Vision
 *                   - Cigna
 *                   - UnitedHealthcare
 *                   - Other
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to update appointment
 */
