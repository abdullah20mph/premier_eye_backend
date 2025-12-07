// src/controllers/user/aiSalesCalls/list.js (or similar)
"use strict";

const Joi = require("joi");
const { getPremierCalls } = require("@src/services");
const { validate, verifyAuth } = require("@src/middleware");
const { response } = require("@src/utils");

const CONTROLLER = [
  // verifyAuth(),  // enable when ready

  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(1000).default(50),
      status: Joi.string().optional(), // "ended,not_connected"
      search: Joi.string().allow("", null).optional(),
    }),
  }),

  async function listAiSalesCalls(req, res) {
    try {
      const { page, status, search } = req.query;

      const statuses = status
        ? status
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

      const data = await getPremierCalls({
        page,
        statuses,
        search,
      });

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
 * /user/ai-calls/list:
 *   get:
 *     tags:
 *       - AI Calls
 *     summary: Fetch paginated AI sales call logs from the Premier table
 *     description: Returns paginated call logs using data from the premier table.
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *           example: 50
 *
 *       - in: query
 *         name: status
 *         description: Comma-separated call statuses (e.g. "ended,not_connected")
 *         schema:
 *           type: string
 *           example: ended,not_connected
 *
 *       - in: query
 *         name: search
 *         description: Search by lead name
 *         schema:
 *           type: string
 *           example: Anthony
 *
 *     responses:
 *       200:
 *         description: Successfully fetched AI sales call logs
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
 *                   example: AI sales calls fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 123
 *                           lead_name:
 *                             type: string
 *                             example: Muhammad Abdullah
 *                           lead_number:
 *                             type: string
 *                             example: +18042221111
 *                           location_preference:
 *                             type: string
 *                             example: Plantation
 *                           ts:
 *                             type: string
 *                             example: 2025-12-01T14:03:19Z
 *                           call_status:
 *                             type: string
 *                             example: ended
 *                           call_summary:
 *                             type: string
 *                             example: The user interacted with an automated agent
 *                           service:
 *                             type: string
 *                             example: Eye Exam
 *                     total:
 *                       type: integer
 *                       example: 472
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *
 *       400:
 *         description: Invalid request parameters
 *
 *       500:
 *         description: Failed to fetch AI sales calls
 */
