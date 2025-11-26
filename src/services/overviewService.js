// src/services/overviewService.js
"use strict";

const { supabase } = require("@src/config/supabase");

const LEADS_TABLE = "premier";

// shape one row for the dashboard "Action Required" card
function mapOverviewRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    lead_name: row.lead_name,
    lead_number: row.lead_number,
    location_preference: row.location_preference,
    source: row.source || null,          // if you add a source column later
    pipeline_stage: row.pipeline_stage,  // should be "NEEDS_ACTION" here
    ai_summary: row.call_summary || null,
    latest_reply: row.latest_reply || null, // or map from another field if needed
    created_at: row.created_at,
    timestamp: row.timestamp || null,
  };
}

/**
 * Fetch only leads that require action (pipeline_stage = 'NEEDS_ACTION')
 * with pagination support.
 */
async function getOverviewCalls({ page = 1, limit = 10 } = {}) {
  const pageNum = Number(page) || 1;
  const pageSize = Number(limit) || 10;
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(LEADS_TABLE)
    .select("*", { count: "exact" })
    .eq("pipeline_stage", "NEEDS_ACTION")    // 🔴 only Needs Action
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Supabase error in getOverviewCalls:", error);
    throw error;
  }

  return {
    items: (data || []).map(mapOverviewRow),
    pagination: {
      page: pageNum,
      limit: pageSize,
      total: count || 0,
      hasMore: count ? to + 1 < count : false,
    },
  };
}

module.exports = {
  getOverviewCalls,
};
