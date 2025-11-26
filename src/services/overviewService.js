"use strict";

const { supabase } = require("@src/config/supabase");

const TABLE_NAME = "premier"; // ← change if your table name is different

/**
 * Get paginated calls for the Overview "Action Required" cards.
 * Right now this just returns latest calls; you can later add filters
 * (e.g. only certain call_status values) if needed.
 */
async function getOverviewCalls({ page = 1, limit = 10 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Select all columns, ordered by created_at (newest first)
  const { data, error, count } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

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
  getOverviewCalls,
};
