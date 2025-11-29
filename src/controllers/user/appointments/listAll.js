"use strict";

const { supabase } = require("@src/config/supabase");

async function listAllAppointments(req, res) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      lead_id,
      scheduled_at,
      status,
      service_type,
      expected_value,
      notes,
      created_at,
      updated_at,
      lead:premier (
        id,
        lead_name,
        lead_number,
        location_preference,
        email
      )
    `)
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }

  return res.status(200).json({
    success: true,
    data,
  });
}

module.exports = [listAllAppointments];
