"use strict";

const { Router } = require("express");
const listRecentActivity = require("@src/controllers/user/dashboard/recent-activity/getList");

const router = Router();

// GET /recent-activity/list
router.route("/list")
    .get(listRecentActivity);

module.exports = Router().use("/recent-activity", router);
