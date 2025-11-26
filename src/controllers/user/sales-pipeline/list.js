"use strict";

const { getSalesPipeline } = require("@src/services/salesPipelineService");
const { verifyAuth } = require("@src/middleware");

const CONTROLLER = [
  verifyAuth(),
  // no validation needed – simple GET
  async function listSalesPipelineController(req, res) {
    try {
      const pipeline = await getSalesPipeline();

      return res.json({
        success: true,
        message: "Sales pipeline fetched successfully",
        data: pipeline,
      });
    } catch (err) {
      console.error("List sales pipeline error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sales pipeline",
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/sales-pipeline:
 *   get:
 *     tags: [Sales Pipeline]
 *     summary: Get leads grouped by pipeline stage (kanban board)
 *     responses:
 *       200:
 *         description: Sales pipeline data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       stage:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       leads:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             lead_name:
 *                               type: string
 *                             lead_number:
 *                               type: string
 *                             location_preference:
 *                               type: string
 *                             email:
 *                               type: string
 *                             pipeline_stage:
 *                               type: string
 *       500:
 *         description: Failed to fetch pipeline
 */
