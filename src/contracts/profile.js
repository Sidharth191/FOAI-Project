// KAIROS CONTRACT — Profile  (v1)
// PRODUCED BY: Person 2 (generateProfile)   CONSUMED BY: Person 4, Person 3, Person 7
// FROZEN.

/**
 * @typedef {Object} Profile
 * @property {number} version
 * @property {string} createdAt              ISO-8601 UTC
 * @property {Persona[]} personas            sorted by weight DESC, weights sum to 100
 * @property {Thresholds} thresholds
 * @property {ProfileLocation[]} locations   locations[0] is ALWAYS the active one
 * @property {Object} personaDetails         same shape as survey.personaDetails
 * @property {string} language               from LANGUAGES
 * @property {string} units                  "metric" (only value for v1)
 *
 * @typedef {Object} Persona
 * @property {string} id                     from PERSONA_IDS
 * @property {number} weight                 integer 0-100
 *
 * @typedef {Object} ProfileLocation
 * @property {string} id                     slug, lowercase, e.g. "chennai"
 * @property {string} name
 * @property {number} latitude
 * @property {number} longitude
 * @property {string|null} timezone
 */

// THRESHOLDS — direction is baked into the KEY NAME so nobody has to guess
// whether 35 means "alert above 35" or "alert below 35".
// A threshold that does not apply to this user MUST be null, never 0, never omitted.
/**
 * @typedef {Object} Thresholds
 * @property {number|null} uvMax
 * @property {number|null} aqiMax
 * @property {number|null} tempMaxC
 * @property {number|null} tempMinC
 * @property {number|null} feelsLikeMaxC
 * @property {number|null} humidityMaxPct
 * @property {number|null} windMaxKph
 * @property {number|null} rainProbMaxPct
 * @property {number|null} soilMoistureMinPct
 * @property {number|null} visibilityMinKm
 */

export const EMPTY_THRESHOLDS = {
  uvMax: null,
  aqiMax: null,
  tempMaxC: null,
  tempMinC: null,
  feelsLikeMaxC: null,
  humidityMaxPct: null,
  windMaxKph: null,
  rainProbMaxPct: null,
  soilMoistureMinPct: null,
  visibilityMinKm: null,
};

export const EMPTY_PROFILE = {
  version: 1,
  createdAt: null,
  personas: [],
  thresholds: { ...EMPTY_THRESHOLDS },
  locations: [],
  personaDetails: {},
  language: "en",
  units: "metric",
};

export function validateProfile(p) {
  const errs = [];
  if (!p || typeof p !== "object") return ["profile is not an object"];
  if (p.version !== 1) errs.push("version must be 1");
  if (!Array.isArray(p.personas) || p.personas.length === 0) errs.push("personas must be non-empty");
  else {
    const sum = p.personas.reduce((s, x) => s + (x.weight || 0), 0);
    if (Math.abs(sum - 100) > 1) errs.push(`persona weights sum to ${sum}, expected 100`);
    p.personas.forEach((x, i) => {
      if (!x.id) errs.push(`personas[${i}].id missing`);
      if (typeof x.weight !== "number") errs.push(`personas[${i}].weight must be a number`);
    });
  }
  if (!p.thresholds) errs.push("thresholds missing");
  else {
    Object.keys(EMPTY_THRESHOLDS).forEach((k) => {
      if (!(k in p.thresholds)) errs.push(`thresholds.${k} missing (use null if N/A)`);
    });
  }
  if (!Array.isArray(p.locations) || p.locations.length === 0) errs.push("locations must be non-empty");
  else if (!p.locations[0].id) errs.push("locations[0].id missing");
  if (!p.language) errs.push("language missing");
  return errs;
}
