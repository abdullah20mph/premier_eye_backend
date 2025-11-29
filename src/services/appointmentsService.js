"use strict";

const { supabase } = require("@src/config/supabase");

const TABLE = "appointments";
const LEADS_TABLE = "premier"; // your existing leads table

// These are the same as in your controller STATUS_VALUES
const STATUS_VALUES = [
  "AI CALLED - NO ANSWER",
  "AI SPOKE TO LEAD",
  "SCHEDULED",
  "NEEDS VA TO FOLLOW UP",
  "APPOINTMENT BOOKED",
  "APPOINTMENT COMPLETED",
  "NO SHOW",
  "NOT INTERESTED",
];

// Helper: build an update object with only defined keys
function buildUpdates(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

function mapAppointment(row) {
  if (!row) return null;
  return {
    id: row.id,
    lead_id: row.lead_id,
    scheduled_at: row.scheduled_at,
    status: row.status,
    service_type: row.service_type,
    expected_value: row.expected_value,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    lead: row.lead || null,
  };
}

// tiles at top of appointments page
async function getAppointmentsSummary() {
  const nowIso = new Date().toISOString();

  // Treat "SCHEDULED" + "APPOINTMENT BOOKED" as upcoming
  const { count: scheduledUpcoming } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .in("status", ["SCHEDULED", "APPOINTMENT BOOKED"])
    .gte("scheduled_at", nowIso);

  // You can refine this later; for now we don't use PENDING_CONFIRMATION at all
  const { count: pendingConfirmation } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "NEEDS VA TO FOLLOW UP")        // or just 0 if you don't want this tile
    .gte("scheduled_at", nowIso);

  const { count: noShowsAllTime } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "NO SHOW");

  const { count: completedAllTime } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "APPOINTMENT COMPLETED");

  return {
    scheduledUpcoming: scheduledUpcoming || 0,
    pendingConfirmation: pendingConfirmation || 0,
    noShowsAllTime: noShowsAllTime || 0,
    completedAllTime: completedAllTime || 0,
  };
}

// cards under "Upcoming 7 days"
async function getUpcomingAppointments({ days = 7 }) {
  const now = new Date();
  const to = new Date();
  to.setDate(now.getDate() + Number(days || 7));

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      lead:${LEADS_TABLE}!appointments_lead_id_fkey (
        id,
        lead_name,
        lead_number,
        location_preference,
        email
      )
    `
    )
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", to.toISOString())
    .in("status", ["SCHEDULED", "APPOINTMENT BOOKED"])
    .order("scheduled_at", { ascending: true });

  if (error) throw error;

  return (data || []).map(mapAppointment);
}

// data for month/week calendar
async function getAppointmentsInRange({ start, end }) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      lead:${LEADS_TABLE}!appointments_lead_id_fkey (
        id,
        lead_name,
        lead_number,
        location_preference,
        email
      )
    `
    )
    .gte("scheduled_at", start)
    .lte("scheduled_at", end)
    .order("scheduled_at", { ascending: true });

  if (error) throw error;

  return (data || []).map(mapAppointment);
}

// from lead detail modal -> "save changes"
async function createAppointment(payload) {
  const {
    lead_id,
    lead_name,
    scheduled_at,
    status,
    service_type,
    expected_value,
    notes,
    location,
    dob,
    insurance,
  } = payload;

  // 1) Update lead personal info in premier, INCLUDING lead_name
  const leadUpdates = buildUpdates({
    lead_name: lead_name || undefined,
    location_preference: location || undefined,
    dob: dob || undefined,
    insurance: insurance || undefined,
  });

  if (Object.keys(leadUpdates).length > 0) {
    const { error: leadError } = await supabase
      .from(LEADS_TABLE)
      .update(leadUpdates)
      .eq("id", lead_id);

    if (leadError) {
      console.error(
        "Supabase error updating lead (createAppointment):",
        leadError
      );
      throw leadError;
    }
  }

  // IMPORTANT: default status must be something allowed by the CHECK constraint
  let statusToInsert = status;
  if (!statusToInsert || !STATUS_VALUES.includes(statusToInsert)) {
    statusToInsert = "SCHEDULED"; // safe default
  }

  // 2) Create appointment row
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      lead_id,
      scheduled_at,
      status: statusToInsert,
      service_type: service_type || null,
      expected_value: expected_value ?? null,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Supabase error inserting appointment:", error);
    throw error;
  }

  return mapAppointment(data);
}

// update existing appointment (reschedule / change status)
async function updateAppointment(id, payload) {
  const {
    scheduled_at,
    status,
    service_type,
    expected_value,
    notes,
    // optional lead info updates
    lead_id,
    location,
    dob,
    insurance,
  } = payload;

  // 1) Optionally update lead personal info if we have a lead_id
  if ((location || dob || insurance || payload.lead_name) && lead_id) {
    const leadUpdates = buildUpdates({
      lead_name: payload.lead_name || undefined,
      location_preference: location || undefined,
      dob: dob || undefined,
      insurance: insurance || undefined,
    });

    if (Object.keys(leadUpdates).length > 0) {
      const { error: leadError } = await supabase
        .from(LEADS_TABLE)
        .update(leadUpdates)
        .eq("id", lead_id);

      if (leadError) {
        console.error(
          "Supabase error updating lead (updateAppointment):",
          leadError
        );
        throw leadError;
      }
    }
  }

  // 2) Appointment update
  const update = buildUpdates({
    scheduled_at,
    status,
    service_type,
    expected_value,
    notes,
    updated_at: new Date().toISOString(),
  });

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return mapAppointment(data);
}

module.exports = {
  getAppointmentsSummary,
  getUpcomingAppointments,
  getAppointmentsInRange,
  createAppointment,
  updateAppointment,
};
