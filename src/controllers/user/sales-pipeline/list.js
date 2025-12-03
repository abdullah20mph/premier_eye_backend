// @src/controllers/user/salesPipeline/getPipeline.js
"use strict";

const Joi = require("joi");
const { getSalesPipeline } = require("./../../../services/salesPipelineService");
const { validate } = require("@src/middleware");
const { response } = require("@src/utils");

const CONTROLLER = [
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),   // currently unused
      limit: Joi.number().integer().min(1).max(100).default(50),
    }),
  }),

  async function getPipeline(req, res) {
    try {
      const pipeline = await getSalesPipeline();

      return response.send(
        1,
        200,
        "Sales pipeline fetched successfully",
        pipeline,
        res
      );
    } catch (err) {
      console.error("Error fetching sales pipeline:", err);

      return response.send(
        0,
        500,
        "Failed to fetch sales pipeline",
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
 * /user/sales-pipeline:
 *   get:
 *     tags:
 *       - Sales Pipeline
 *     summary: Get sales pipeline grouped by stage
 *     description: Returns all leads grouped by pipeline stage.
 *     responses:
 *       200:
 *         description: Pipeline fetched successfully
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
 *                             email:
 *                               type: string
 *                             location_preference:
 *                               type: string
 *                             pipeline_stage:
 *                               type: string
 *                               enum:
 *                                 - NEW_LEAD
 *                                 - AI_ENGAGING
 *                                 - NEEDS_ACTION
 *                                 - BOOKED
 *                                 - COMPLETED_PAID
 */
