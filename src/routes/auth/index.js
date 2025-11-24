"use strict";

const { Router } = require("express");
const userInteraction = require("./interaction");

const router = Router();

router.use(userInteraction);

module.exports = Router().use("/auth", router);
