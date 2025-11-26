
const { Router } = require("express");
const AiSalesCalls= require("./AiSalesCalls");
const dashboard = require("./dashboard");
const Appointments = require("./Appointments");
const SalesPipeline = require("./SalesPipeline");
const Settings = require("./Settings");

const router = Router();

router.use(AiSalesCalls);
router.use(dashboard);
router.use(Appointments);
router.use(SalesPipeline);
router.use(Settings);

// ------------------------- Exports --------------------------------

module.exports = Router().use("/user", router);
