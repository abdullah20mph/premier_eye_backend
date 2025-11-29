// src/controllers/user/aiSalesCalls/list.js (or similar)
"use strict";

const Joi = require("joi");
const { getAiSalesCalls } = require("@src/services/aiSalesCallService");
const { validate, verifyAuth } = require("@src/middleware");
const { response } = require("@src/utils");

const CONTROLLER = [
  // verifyAuth(),  // enable when ready

  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
      status: Joi.string().optional(), // "answered,voicemail"
      search: Joi.string().allow("", null).optional(),
    }),
  }),

  async function listAiSalesCalls(req, res) {
    try {
      const { page, limit, status, search } = req.query;

      const statuses = status
        ? status
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

      const data = await getAiSalesCalls({
        page,
        limit,
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
