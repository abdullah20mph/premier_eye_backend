"use strict";

const Joi = require("joi");
const { validate } = require("@src/middleware");
const { getOverviewCalls } = require("@src/services/overviewService");

/**
 * GET /user/overview/action-required
 *
 * Query params:
 *  - page (optional, default 1)
 *  - limit (optional, default 10)
 */
const CONTROLLER = [
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    }),
  }),

  async function listOverviewActionRequired(req, res) {
    try {
      const { page, limit } = req.query;

      const result = await getOverviewCalls({ page, limit });

      return res.json({
        success: true,
        message: "Overview calls fetched successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error fetching overview calls:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch overview calls",
        error: err.message || err,
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/dashboard/overview/action-required/get-list:
 *   get:
 *     tags: [Overview]
 *     summary: Get AI overview cards (Action Required)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of calls for the overview section
 */
