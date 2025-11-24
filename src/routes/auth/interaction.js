"use strict";

const {
  userLoginController,
  userRegisterController,
} = require("@src/controllers/auth/interaction");

const { Router } = require("express");
const router = Router();

router.route("/login")
    .post(userLoginController);

router.route("/register")
    .post(userRegisterController);

module.exports = Router().use("/interaction", router);
