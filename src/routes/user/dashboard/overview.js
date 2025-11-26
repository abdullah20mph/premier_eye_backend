"use strict";

const { Router } = require("express");
const listOverviewActionRequired = require("@src/controllers/user/dashboard/overview/getList");


const router = Router();

// GET /overview/action-required
router.route("/get-list")
    .get(listOverviewActionRequired);

module.exports = Router().use("/overview/action-required", router);