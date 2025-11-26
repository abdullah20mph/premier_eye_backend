"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const {
  PIPELINE_STAGES,
  updateLeadStage,
} = require("@src/services/salesPipelineService");

const CONTROLLER = [
  verifyAuth(),
  validate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    body: Joi.object({
      pipeline_stage: Joi.string()
        .valid(...PIPELINE_STAGES)
        .required(),
    }),
  }),

  async function updateLeadStageController(req, res) {
    try {
      const id = Number(req.params.id);
      const { pipeline_stage } = req.body;

      const lead = await updateLeadStage(id, pipeline_stage);

      return res.json({
        success: true,
        message: "Lead stage updated successfully",
        data: lead,
      });
    } catch (err) {
      console.error("Update lead stage error:", err);

      if (err.code === "INVALID_STAGE") {
        return res.status(400).json({
          success: false,
          message: "Invalid pipeline stage",
        });
      }

      if (err.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update lead stage",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/sales-pipeline/{id}/stage:
 *   patch:
 *     tags: [Sales Pipeline]
 *     summary: Update a lead's pipeline stage (drag & drop card)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lead ID (from premier table)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pipeline_stage:
 *                 type: string
 *                 enum:
 *                   - NEW_LEAD
 *                   - AI_ENGAGING
 *                   - NEEDS_ACTION
 *                   - BOOKED
 *                   - COMPLETED_PAID
 *                 example: "BOOKED"
 *     responses:
 *       200:
 *         description: Lead stage updated successfully
 *       400:
 *         description: Invalid stage
 *       404:
 *         description: Lead not found
 *       500:
 *         description: Failed to update stage
 */
