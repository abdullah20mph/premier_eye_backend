"use strict";

const { supabase } = require("@src/config/supabase");

const TABLE = "appointments";
const LEADS_TABLE = "premier"; // your existing leads table

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

  const { count: scheduledUpcoming } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "SCHEDULED")
    .gte("scheduled_at", nowIso);

  const { count: pendingConfirmation } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING_CONFIRMATION")
    .gte("scheduled_at", nowIso);

  const { count: noShowsAllTime } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "NO_SHOW");

  const { count: completedAllTime } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("status", "COMPLETED");

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
    .in("status", ["SCHEDULED", "PENDING_CONFIRMATION"])
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
    scheduled_at,
    status,
    service_type,
    expected_value,
    notes,
    // personal info fields
    location,
    dob,
    insurance,
  } = payload;

  // 1) Update lead personal info in premier if anything is provided
  if (location || dob || insurance) {
    const leadUpdates = buildUpdates({
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
        console.error("Supabase error updating lead (createAppointment):", leadError);
        throw leadError;
      }
    }
  }

  // 2) Create appointment row
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      lead_id,
      scheduled_at,
      status: status || "PENDING_CONFIRMATION",
      service_type: service_type || null,
      expected_value: expected_value ?? null,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) throw error;

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
  if ((location || dob || insurance) && lead_id) {
    const leadUpdates = buildUpdates({
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
        console.error("Supabase error updating lead (updateAppointment):", leadError);
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
