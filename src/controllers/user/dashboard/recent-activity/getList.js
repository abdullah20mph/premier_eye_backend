"use strict";

const Joi = require("joi");
const { validate, verifyAuth } = require("@src/middleware");
const { getRecentActivity } = require("@src/services/getRecentActivity");

const CONTROLLER = [
    verifyAuth(),
  // validate query params
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().allow("", null).optional(),
      source: Joi.string().allow("", null).optional(), // e.g. "Google Ads,Website Chat"
      status: Joi.string().allow("", null).optional(), // e.g. "Needs VA Follow-Up,New"
    }),
  }),

  async function listRecentActivity(req, res) {
    try {
      const { page, limit, search, source, status } = req.query;

      const result = await getRecentActivity({
        page,
        limit,
        search,
        source,
        status,
      });

      return res.json({
        success: true,
        message: "Recent activity fetched successfully",
        data: result,
      });
    } catch (err) {
      console.error("Error fetching recent activity:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch recent activity",
        error: err.message || err,
      });
    }
  },
];

module.exports = CONTROLLER;

/**
 * @swagger
 * /user/dashboard/recent-activity/list:
 *   get:
 *     tags: [Dashboard - Recent Activity]
 *     summary: Get recent lead activity
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
 *           example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "David"
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           example: "Google Ads,Website Chat"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: "Needs VA Follow-Up,Appointment Booked"
 *     responses:
 *       200:
 *         description: Recent activity list
 */
