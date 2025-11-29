"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const { createAppointment } = require("@src/services/appointmentsService");

// ==== Shared enums ====
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
    body: Joi.object({
      // appointment core
      lead_id: Joi.number().integer().required(),
      lead_name: Joi.string().allow("", null).optional(),
      scheduled_at: Joi.string().isoDate().required(),

      status: Joi.string()
        .valid(...STATUS_VALUES)
        .optional(),

      service_type: Joi.string()
        .valid(...SERVICE_TYPES)
        .allow(null, "")
        .optional(),

      expected_value: Joi.number().allow(null).optional(),
      notes: Joi.string().allow("", null).optional(),

      // personal info (lead)
      location: Joi.string()
        .valid(...LOCATIONS)
        .allow("", null)
        .optional(),

      dob: Joi.string().allow("", null).optional(), // UI can send "1965-02-20" or "02/20/1965"

      insurance: Joi.string()
        .valid(...INSURANCE_PROVIDERS)
        .allow("", null)
        .optional(),
    }),
  }),

  async function createAppointmentController(req, res) {
    try {
      const appt = await createAppointment(req.body);

      return res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        data: appt,
      });
    } catch (err) {
      console.error("Create appointment error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to create appointment",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create a new appointment (and optionally update lead personal info)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lead_id:
 *                 type: integer
 *                 example: 12
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-28T16:00:00.000Z"
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
 *                 example: "SCHEDULED"
 *               service_type:
 *                 type: string
 *                 enum:
 *                   - LASIK CONSULTANT
 *                   - COMPREHENSIVE EYE EXAM
 *                   - CONTACT LENS FITTING
 *                   - DRY EYE TREATMENT
 *                 example: "CONTACT LENS FITTING"
 *               expected_value:
 *                 type: number
 *                 example: 120
 *               notes:
 *                 type: string
 *                 example: "AI detected booking intent. VA confirmed with patient."
 *               location:
 *                 type: string
 *                 description: Lead's preferred practice location
 *                 enum: [Plantation, Boca Raton, West Palm]
 *                 example: "Boca Raton"
 *               dob:
 *                 type: string
 *                 description: Date of birth
 *                 example: "1965-02-20"
 *               insurance:
 *                 type: string
 *                 description: Insurance provider
 *                 enum:
 *                   - VSP
 *                   - EyeMed
 *                   - Spectera
 *                   - Humana Vision
 *                   - Cigna
 *                   - UnitedHealthcare
 *                   - Other
 *                 example: "Cigna"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to create appointment
 */
