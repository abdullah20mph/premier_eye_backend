// @src/controllers/user/salesPipeline/updateStage.js
"use strict";

const Joi = require("joi");
const { updateLeadStage } = require("@src/services/SalesPipelineService");
const { validate } = require("@src/middleware");
const { response } = require("@src/utils");

const CONTROLLER = [
  validate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    body: Joi.object({
      pipeline_stage: Joi.string()
        .valid(
          "NEW_LEAD",
          "AI_ENGAGING",
          "NEEDS_ACTION",
          "BOOKED",
          "COMPLETED_PAID"
        )
        .required(),
    }),
  }),

  async function updateStage(req, res) {
    try {
      const leadId = Number(req.params.id);
      const { pipeline_stage } = req.body;

      const updated = await updateLeadStage(leadId, pipeline_stage);

      return response.send(
        1,
        200,
        "Lead pipeline stage updated successfully",
        updated,
        res
      );
    } catch (err) {
      console.error("Error updating pipeline stage:", err);

      return response.send(
        0,
        500,
        "Failed to update pipeline stage",
        null,
        res,
        err
      );
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/sales-pipeline/{id}/stage:
 *   patch:
 *     tags:
 *       - Sales Pipeline
 *     summary: Update a lead's pipeline stage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Stage updated successfully
 *       400:
 *         description: Invalid stage
 *       404:
 *         description: Lead not found
 *       500:
 *         description: Server error
 */
