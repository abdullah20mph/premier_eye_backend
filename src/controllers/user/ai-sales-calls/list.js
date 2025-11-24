"use strict";

const Joi = require("joi");
const { getAiSalesCalls } = require("@src/services/aiSalesCallService");
const { validate } = require("@src/middleware/validate");
const { response } = require("@src/utils");

const CONTROLLER = [
  // validate query params
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      status: Joi.string().optional(),
      search: Joi.string().optional(),
    }),
  }),

  // actual handler
  async function listAiSalesCalls(req, res) {
    try {
      const { page, limit, status, search } = req.query;

      const data = await getAiSalesCalls({ page, limit, status, search });

      return response.send(
        1,
        200,
        "AI sales calls fetched successfully",
        data,
        res
      );
    } catch (err) {
      console.error("Error fetching AI sales calls:", err);
      return response.send(
        0,
        500,
        "Failed to fetch AI sales calls",
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
 * /user/ai-sales-calls/list:
 *   get:
 *     tags: [AI Sales Calls]
 *     summary: Get paginated AI sales call feed
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size (default 20)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Comma-separated call statuses to filter (e.g. answered,booked)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by lead name
 *     responses:
 *       200:
 *         description: AI Sales Calls list
 */
