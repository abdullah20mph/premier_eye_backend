"use strict";

const { Router } = require("express");

const overview = require("./overview");
const recentActivity = require("./recent-activity");
const router = Router();

router.use(overview);
router.use(recentActivity);
// ------------------------- Exports --------------------------------

module.exports = Router().use("/dashboard", router);