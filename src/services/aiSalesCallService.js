"use strict";

const { supabase } = require("@src/config/supabase");

const TABLE_NAME = "premier"; // change to "premier" if that’s your table

/**
 * Fetch paginated AI sales call data
 * Supports:
 *  - page / limit
 *  - status filter (?status=answered,booked)
 *  - search by lead name (?search=kim)
 */
async function getAiSalesCalls({ page = 1, limit = 20, status, search }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("id, created_at, lead_name, location_preference, call_status, call_summary", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  // optional status filter (comma separated)
  if (status) {
    const statuses = String(status)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (statuses.length > 0) {
      query = query.in("call_status", statuses);
    }
  }

  // optional search on lead_name
  if (search) {
    query = query.ilike("lead_name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    items: data || [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

module.exports = {
  getAiSalesCalls,
};
