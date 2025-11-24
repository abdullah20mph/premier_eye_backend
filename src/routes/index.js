"use strict";

const cors = require("cors");
const { Router, ...express } = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const auth = require('./auth')
const user = require('./user')

const router = Router();


if (process.env.NODE_ENV == 'development') {
  router.use(morgan("dev"));
}
router
  .use(cors())
  .use(helmet())
  .use(express.static(
    path.resolve(__dirname, "..", "..", "public"),
    {
      index: false,
    },
  ));

// ------------------------- Routes ---------------------------------
//handle root route
router
  .use(auth)
  .use(user);

if (process.env.NODE_ENV === 'PRODUCTION') {
  //TODO
}

// ------------------------- Exports --------------------------------

module.exports = router;