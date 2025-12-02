"use strict";

const { Router } = require("express");

const {getProfileController, updateProfileController, changePasswordController} = require("@src/controllers/user/settings");

const router = Router();

router.route("/profile")
  .get(getProfileController)

router.route("/profile")
  .patch(updateProfileController);

router.route("/password")
  .patch(changePasswordController); // PATCH /user/settings/password


  module.exports = Router().use("/settings", router);
