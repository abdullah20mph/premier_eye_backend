"use strict";

const { Router } = require("express");
const listAiSalesCalls = require("@src/controllers/user/ai-sales-calls/list");


const router = Router();

// GET /ai-sales-calls
router.route("/list").get(listAiSalesCalls);

module.exports = Router().use("/ai-calls", router);
