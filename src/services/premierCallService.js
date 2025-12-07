"use strict";

const { supabase } = require("@src/config/supabase");

async function getPremierCalls({
  page = 1,
  statuses = null,
  search = "",
}) {
  // 🚨 Remove limit entirely
  // const offset = (page - 1) * limit;

  let query = supabase
    .from("premier")
    .select(
      `
      id,
      lead_name,
      lead_number,
      location_preference,
      service,
      call_status,
      call_summary,
      timestamp,
      call_url
    `,
      { count: "exact" }
    )
    .order("timestamp", { ascending: false }); // ❌ removed .range()

  // Search
  if (search) {
    const s = `%${search}%`;
    query = query.or(`lead_name.ilike.${s},lead_number.ilike.${s}`);
  }

  // Status filter
  if (statuses && statuses.length) {
    query = query.in("call_status", statuses);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase Premier query error:", error);
    throw error;
  }

  const items = (data || []).map((row) => ({
    id: row.id,
    lead_name: row.lead_name,
    lead_number: row.lead_number,
    location_preference: row.location_preference,
    service: row.service,
    call_status: row.call_status,
    call_summary: row.call_summary,
    timestamp: row.timestamp
      ? new Date(Number(row.timestamp)).toISOString()
      : null,
    call_url: row.call_url,
  }));

  return {
    items,
    total: count || 0,
    page,      // still return for compatibility
    limit: 50, // always 50
  };
}

module.exports = { getPremierCalls };
