"use strict";

const { Router } = require("express");

const { appointmentsSummaryController, upcomingAppointmentsController, createAppointmentController, updateAppointmentController, appointmentsRangeController } = require("@src/controllers/user/appointments");


const router = Router();

router.route("/summary")
    .get(appointmentsSummaryController);

router.route("/upcoming")
    .get(upcomingAppointmentsController);

router.route("/range")
    .get(appointmentsRangeController);

router.route("/")
    .post(createAppointmentController);

router.route("/:id")
    .patch(updateAppointmentController);

module.exports = Router().use("/appointments", router);
