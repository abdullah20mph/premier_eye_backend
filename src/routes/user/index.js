
const { Router } = require("express");
const AiSalesCalls= require("./AiSalesCalls");
const dashboard = require("./dashboard");
const Appointments = require("./Appointments");

const router = Router();

router.use(AiSalesCalls);
router.use(dashboard);
router.use(Appointments);
// ------------------------- Exports --------------------------------

module.exports = Router().use("/user", router);
