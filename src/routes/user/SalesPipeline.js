"use strict";

const { Router } = require("express");
const {
  listSalesPipelineController,
  updateLeadStageController,
} = require("@src/controllers/user/sales-pipeline");

const router = Router();

// GET /user/sales-pipeline  -> full board
router.route("/get-pipeline")
  .get(listSalesPipelineController);

// PATCH /user/sales-pipeline/:id/stage  -> drag & drop
router.route("/:id/stage")
  .patch(updateLeadStageController);

module.exports = Router().use("/sales-pipeline", router);
