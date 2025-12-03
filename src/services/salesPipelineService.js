// @src/services/salesPipelineService.js
"use strict";

const { supabase } = require("@src/config/supabase");

const LEADS_TABLE = "premier";

const PIPELINE_STAGES = [
  "NEW_LEAD",
  "AI_ENGAGING",
  "NEEDS_ACTION",
  "BOOKED",
  "COMPLETED_PAID",
];

function mapLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    lead_name: row.lead_name,
    lead_number: row.lead_number,
    location_preference: row.location_preference,
    email: row.email,
    pipeline_stage: row.pipeline_stage || "NEW_LEAD",
  };
}

/**
 * Get the full sales pipeline grouped by stage.
 * Returns:
 * {
 *   NEW_LEAD: { stage: 'NEW_LEAD', count: number, leads: [...] },
 *   AI_ENGAGING: { ... },
 *   ...
 * }
 */
async function getSalesPipeline() {
  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .select(`
      id,
      lead_name,
      lead_number,
      email,
      location_preference,
      pipeline_stage
    `);

  if (error) throw error;

  const grouped = {};

  for (const row of data || []) {
    const stage = row.pipeline_stage || "NEW_LEAD";

    if (!grouped[stage]) {
      grouped[stage] = {
        stage,
        count: 0,
        leads: [],
      };
    }

    grouped[stage].leads.push(mapLead(row));
    grouped[stage].count += 1;
  }

  return grouped;
}

/**
 * Update a single lead's stage.
 */
async function updateLeadStage(leadId, newStage) {
  if (!PIPELINE_STAGES.includes(newStage)) {
    throw new Error("Invalid pipeline stage");
  }

  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .update({ pipeline_stage: newStage })
    .eq("id", leadId)
    .select(`
      id,
      lead_name,
      lead_number,
      location_preference,
      email,
      pipeline_stage
    `)
    .single();

  if (error) throw error;

  return mapLead(data);
}

module.exports = {
  PIPELINE_STAGES,
  getSalesPipeline,
  updateLeadStage,
};
