// ============================================================================
// P2 — AI ENGINE                STATUS: STUB (written by P4)
// ----------------------------------------------------------------------------
// P2: two functions, two return shapes. Build the RULES path first, the AI
// path second. If the AI fails, this must still return a valid object.
// ============================================================================
import { validateProfile, validateInsights } from "../../contracts/index.js";
import { mockProfile, mockProfileB, mockInsights, mockInsightsB } from "../../data/mockData.js";

export async function generateProfile(surveyAnswers) {
  await new Promise((r) => setTimeout(r, 900));

  // ---- STUB BODY ----
  const isFitness = (surveyAnswers?.interests || []).includes("fitness");
  const profile = {
    ...(isFitness ? mockProfileB : mockProfile),
    createdAt: new Date().toISOString(),
  };
  if (import.meta.env.DEV) {
    const errs = validateProfile(profile);
    if (errs.length) console.warn("[ai] profile contract violation:", errs);
  }
  return profile;
  // ---- END STUB BODY ----
}

export async function generateInsights(profile, reading) {
  await new Promise((r) => setTimeout(r, 600));

  // ---- STUB BODY ----
  const isFitness = (profile?.personas || []).some((p) => p.id === "fitness");
  const insights = {
    ...(isFitness ? mockInsightsB : mockInsights),
    generatedAt: new Date().toISOString(),
    locationId: reading?.locationId ?? null,
  };
  if (import.meta.env.DEV) {
    const errs = validateInsights(insights);
    if (errs.length) console.warn("[ai] insights contract violation:", errs);
  }
  return insights;
  // ---- END STUB BODY ----
}
