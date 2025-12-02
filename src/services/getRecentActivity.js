"use strict";

const { supabase } = require("@src/config/supabase");

const TABLE_NAME = "premier";

async function getRecentActivity({ page = 1, limit = 20, search, source, status }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1️⃣ Base query for leads (premier)
  let query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .order("id", { descending: true })
    .range(from, to);

  // 🔍 Search filter
  if (search) {
    const s = `%${search}%`;
    query = query.or(
      `lead_name.ilike.${s},lead_number.ilike.${s},email.ilike.${s}`
    );
  }

  // 🏷️ Source filter (maps to service)
  if (source) {
    const sources = String(source)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (sources.length) query = query.in("service", sources);
  }

  // 🧾 Status filter (maps to call_status)
  if (status) {
    const statuses = String(status)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (statuses.length) query = query.in("call_status", statuses);
  }

  const { data: leadRows, error, count } = await query;
  if (error) throw error;

  const leads = leadRows || [];
  const leadIds = leads.map((row) => row.id);

  // 2️⃣ Fetch appointments for these leads
  let apptRows = [];
  if (leadIds.length) {
    const { data: apptsData, error: apptsError } = await supabase
      .from("appointments")
      .select("id, lead_id, scheduled_at, status")
      .in("lead_id", leadIds)
      .order("scheduled_at", { ascending: false });

    if (apptsError) throw apptsError;
    apptRows = apptsData || [];
  }

  // 3️⃣ Group appointments by lead_id
  const apptsByLead = new Map();
  for (const appt of apptRows) {
    if (!apptsByLead.has(appt.lead_id)) apptsByLead.set(appt.lead_id, []);
    apptsByLead.get(appt.lead_id).push(appt);
  }

  // 4️⃣ Expand: one item per appointment (or one empty item if none)
  const items = [];
  for (const row of leads) {
    const appts = apptsByLead.get(row.id) || [];

    if (!appts.length) {
      items.push({
        ...row,
        appointmentDate: null,
        appointmentStatus: null,
      });
      continue;
    }

    for (const appt of appts) {
      items.push({
        ...row,
        appointmentDate: appt.scheduled_at,
        appointmentStatus: appt.status,
      });
    }
  }

  return {
    items,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

module.exports = {
  getRecentActivity,
};
