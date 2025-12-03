"use strict";

const { Router } = require("express");
const {
  getPipeline,
  updateStage,
} = require("@src/controllers/user/sales-pipeline");

const router = Router();

// GET /user/sales-pipeline  -> full board
router.route("/")
  .get(getPipeline);

// PATCH /user/sales-pipeline/:id/stage  -> drag & drop
router.route("/:id/stage")
  .patch(updateStage);

module.exports = Router().use("/sales-pipeline", router);
