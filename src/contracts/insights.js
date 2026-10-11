// KAIROS CONTRACT — Insights  (v1)
// PRODUCED BY: Person 2 (generateInsights)   CONSUMED BY: Person 4
// FROZEN.
//
// THIS IS THE CONTRACT YOUR ORIGINAL PLAN WAS MISSING.
// The Profile is generated ONCE after the survey. But the homepage's alerts and
// personalised text change EVERY time the Reading changes. That is a second,
// separate AI call — and if it is not frozen now, P4 and P2 will build two
// different homepages.
//
//   generateProfile(surveyAnswers)      -> Profile     (once, after survey)
//   generateInsights(profile, reading)  -> Insights    (every refresh / location switch)
//
// RULE: generateInsights NEVER throws. If the AI call fails, P2 falls back to
// deterministic threshold comparison (reading.uv > thresholds.uvMax -> alert)
// and returns a valid Insights object with error set. The homepage must still work
// with zero AI availability — that is what gets you through a demo on bad wifi.

/**
 * @typedef {Object} Insights
 * @property {number} version
 * @property {string} generatedAt          ISO-8601 UTC
 * @property {string} locationId
 * @property {string} headline             ONE short line, max ~70 chars, already translated
 * @property {Alert[]} alerts              sorted: critical first, then warning, then info
 * @property {Card[]} cards                the persona-specific homepage cards, sorted by priority DESC
 * @property {string} source               "ai" | "rules"
 * @property {InsightsError|null} error
 *
 * @typedef {Object} Alert
 * @property {string} id                   stable slug, e.g. "uv-extreme"
 * @property {string} severity             from SEVERITIES
 * @property {string} personaId            which persona triggered it, from PERSONA_IDS
 * @property {string} icon                 single emoji, e.g. "☀️"
 * @property {string} title                max ~40 chars
 * @property {string} message              max ~140 chars, actionable
 * @property {string|null} metric          the reading key, e.g. "uv"
 * @property {number|string|null} value    the reading value that triggered it
 *
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} personaId
 * @property {string} title
 * @property {string} body                 max ~200 chars
 * @property {number} priority             integer 0-100, higher renders first
 * @property {string|null} icon
 *
 * @typedef {Object} InsightsError
 * @property {string} code                 from ERROR_CODES
 * @property {string} message
 */

export const EMPTY_INSIGHTS = {
  version: 1,
  generatedAt: null,
  locationId: null,
  headline: "",
  alerts: [],
  cards: [],
  source: "rules",
  error: null,
};

export function validateInsights(i) {
  const errs = [];
  if (!i || typeof i !== "object") return ["insights is not an object"];
  if (i.version !== 1) errs.push("version must be 1");
  if (!Array.isArray(i.alerts)) errs.push("alerts must be an array (use [] if none)");
  if (!Array.isArray(i.cards)) errs.push("cards must be an array (use [] if none)");
  (i.alerts || []).forEach((a, n) => {
    ["id", "severity", "personaId", "title", "message"].forEach((k) => {
      if (!a[k]) errs.push(`alerts[${n}].${k} missing`);
    });
  });
  (i.cards || []).forEach((c, n) => {
    if (typeof c.priority !== "number") errs.push(`cards[${n}].priority must be a number`);
  });
  return errs;
}
