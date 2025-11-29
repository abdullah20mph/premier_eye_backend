"use strict";

const { supabase } = require("@src/config/supabase");

/**
 * Fetch paginated AI sales calls.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 * @param {string[]} [params.statuses]   // ["answered","voicemail",...]
 * @param {string} [params.search]       // search by lead_name
 */
async function getAiSalesCalls({
  page = 1,
  limit = 50,
  statuses = null,
  search = "",
}) {
  const offset = (page - 1) * limit;

  // 🔹 Build base query
  let query = supabase
    .from("ai_sales_calls")
    .select(
      `
      id,
      ts,
      duration_sec,
      outcome,
      summary,
      recording_url,
      lead_id,
      premier:premier!ai_sales_calls_lead_id_fkey (
        id,
        lead_name,
        lead_number,
        location_preference
      )
    `,
      { count: "exact" }
    )
    .order("ts", { ascending: false })
    .range(offset, offset + limit - 1);

  // 🔹 Filter by status (answered, voicemail, no_response, booked)
  if (statuses && statuses.length) {
    query = query.in("outcome", statuses);
  }

  // 🔹 Simple name search
  if (search) {
    query = query.ilike("premier.lead_name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase getAiSalesCalls error:", error);
    throw error;
  }

  // ✅ Shape rows exactly like your Frontend `BackendAiCallRow`
  const items = (data || []).map((row) => ({
    id: row.id,
    ts: row.ts,
    outcome: row.outcome,
    summary: row.summary,
    recording_url: row.recording_url,
    lead_id: row.lead_id,
    lead_name: row.premier?.lead_name ?? null,
    lead_number: row.premier?.lead_number ?? null,
    location_preference: row.premier?.location_preference ?? null,
  }));

  return {
    items,
    total: count ?? 0,
    page,
    limit,
  };
}

module.exports = {
  getAiSalesCalls,
};
