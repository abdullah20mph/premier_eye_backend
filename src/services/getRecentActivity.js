"use strict";

const { supabase } = require("@src/config/supabase");

const TABLE_NAME = "premier"; // change if your table name is different

/**
 * Fetch paginated recent activity from Supabase.
 * Supports search, source filter, and status filter.
 */
async function getRecentActivity({ page = 1, limit = 20, search, source, status }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" }) // all columns
    .order("created_at", { ascending: false })
    .range(from, to);

  // 🔍 Search in lead_name, lead_number, email
  if (search) {
    const s = `%${search}%`;
    query = query.or(
      `lead_name.ilike.${s},lead_number.ilike.${s},email.ilike.${s}`
    );
  }

  // 🏷️ Filter by source (maps to `service` column)
  if (source) {
    const sources = String(source)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (sources.length) {
      query = query.in("service", sources);
    }
  }

  // 🧾 Filter by status (maps to `call_status` column)
  if (status) {
    const statuses = String(status)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (statuses.length) {
      query = query.in("call_status", statuses);
    }
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
  getRecentActivity,
};
