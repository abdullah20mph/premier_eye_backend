
const { Router } = require("express");
const AiSalesCalls= require("./AiSalesCalls");

const router = Router();

router.use(AiSalesCalls);

module.exports = Router().use("/user", router);
