"use strict";

const Joi = require("joi");
const { SalesPipeline } = require("@src/services");
const { validate } = require("@src/middleware");
const { response } = require("@src/utils");

const CONTROLLER = [
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
    }),
  }),

  async function getPipeline(req, res) {
    try {
      const pipeline = await SalesPipeline.getSalesPipeline();

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
