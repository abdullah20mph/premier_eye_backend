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
 * Shape:
 * {
 *   NEW_LEAD: { stage: "NEW_LEAD", count: 0, leads: [...] },
 *   AI_ENGAGING: { ... },
 *   ...
 * }
 */
async function getSalesPipeline() {
  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .select(
      `
      id,
      lead_name,
      lead_number,
      location_preference,
      email,
      pipeline_stage
    `
    );

  if (error) throw error;

  const byStage = {};

  // initialize all stages
  for (const stage of PIPELINE_STAGES) {
    byStage[stage] = {
      stage,
      count: 0,
      leads: [],
    };
  }

  (data || []).forEach((row) => {
    const lead = mapLead(row);
    const stage = PIPELINE_STAGES.includes(lead.pipeline_stage)
      ? lead.pipeline_stage
      : "NEW_LEAD";

    byStage[stage].leads.push(lead);
    byStage[stage].count += 1;
  });

  return byStage;
}

/**
 * Update a single lead's pipeline stage (for drag-and-drop).
 */
async function updateLeadStage(leadId, newStage) {
  if (!PIPELINE_STAGES.includes(newStage)) {
    const err = new Error("Invalid pipeline stage");
    err.code = "INVALID_STAGE";
    throw err;
  }

  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .update({ pipeline_stage: newStage })
    .eq("id", leadId)
    .order("id", { ascending: true })
    .select(
      `
      id,
      lead_name,
      lead_number,
      location_preference,
      email,
      pipeline_stage
    `
    )
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // no rows found
      const err = new Error("Lead not found");
      err.code = "NOT_FOUND";
      throw err;
    }
    throw error;
  }

  return mapLead(data);
}

module.exports = {
  PIPELINE_STAGES,
  getSalesPipeline,
  updateLeadStage,
};
