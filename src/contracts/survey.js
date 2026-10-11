// KAIROS CONTRACT — surveyAnswers  (v1)
// PRODUCED BY: Person 1   CONSUMED BY: Person 2
// FROZEN. Keys, casing, types and units below cannot change without P4 sign-off.

/**
 * @typedef {Object} SurveyAnswers
 * @property {number} version              always CONTRACT_VERSION
 * @property {string} completedAt          ISO-8601 UTC, e.g. "2026-08-26T09:00:00.000Z"
 * @property {SurveyLocation} location
 * @property {string[]} interests          subset of PERSONA_IDS, at least 1
 * @property {string[]} activities         subset of ACTIVITY_IDS, may be []
 * @property {Object} personaDetails       free-form per persona, see below
 * @property {Object} preferences
 *
 * @typedef {Object} SurveyLocation
 * @property {string} name                 "Chennai"
 * @property {number} latitude             13.08
 * @property {number} longitude            80.27
 * @property {string|null} country         "IN" or null
 * @property {string|null} timezone        IANA, "Asia/Kolkata" or null
 */

// personaDetails keys are persona IDs. Only these sub-keys are used:
//   farmer:    { crop: string, stage: string, fieldSizeAcres: number|null }
//   commuter:  { departure: "HH:MM", returnTime: "HH:MM", mode: string }
//   parent:    { childAgeYears: number|null, schoolTime: "HH:MM"|null }
//   fitness:   { activity: string, preferredTime: "HH:MM"|null }
//   health:    { conditions: string[] }        // e.g. ["asthma"]
//   outdoor:   { activity: string }
//   elderly:   { conditions: string[] }
// Missing detail  =>  omit the persona key entirely. Never send {}.

export const EMPTY_SURVEY_ANSWERS = {
  version: 1,
  completedAt: null,
  location: { name: "", latitude: null, longitude: null, country: null, timezone: null },
  interests: [],
  activities: [],
  personaDetails: {},
  preferences: { language: "en", units: "metric" },
};

/** Returns [] when valid, otherwise a list of human-readable problems. */
export function validateSurveyAnswers(a) {
  const errs = [];
  if (!a || typeof a !== "object") return ["surveyAnswers is not an object"];
  if (a.version !== 1) errs.push("version must be 1");
  if (!a.location) errs.push("location missing");
  else {
    if (typeof a.location.latitude !== "number") errs.push("location.latitude must be a number");
    if (typeof a.location.longitude !== "number") errs.push("location.longitude must be a number");
    if (!a.location.name) errs.push("location.name missing");
  }
  if (!Array.isArray(a.interests) || a.interests.length === 0)
    errs.push("interests must be a non-empty array of persona IDs");
  if (!Array.isArray(a.activities)) errs.push("activities must be an array (may be empty)");
  if (!a.preferences || !a.preferences.language) errs.push("preferences.language missing");
  return errs;
}
