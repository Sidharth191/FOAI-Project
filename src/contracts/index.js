// KAIROS — contract barrel. Import from here, never from a module's internals.
//
//   import { validateReading, PERSONA_IDS } from "../contracts";
//
// ============================================================================
// FROZEN FUNCTION SIGNATURES — every one of these is async and returns a Promise.
// Even getSurveyAnswers. Uniform async means P4 never has to remember which is
// which, and P1/P3 can add storage or network later without changing callers.
// ============================================================================
//
//   P1  services/survey/index.js
//       async getSurveyAnswers(): Promise<SurveyAnswers>
//
//   P2  services/ai/index.js
//       async generateProfile(surveyAnswers): Promise<Profile>
//       async generateInsights(profile, reading): Promise<Insights>
//
//   P3  services/weather/index.js
//       async getReading(location): Promise<Reading>
//           location = { id, latitude, longitude }   <-- id is REQUIRED, it is
//           echoed back as reading.locationId so P4 can tell stale responses apart
//           when the user switches location fast.
//
//   P5  services/cache/index.js
//       async cacheGet(key): Promise<any|null>
//       async cacheSet(key, value, ttlSeconds): Promise<void>
//
//   P7  services/profile/index.js
//       async updateProfile(profile, changes): Promise<Profile>
//       async switchLocation(profile, locationId): Promise<Profile>
//           BOTH return a NEW Profile object. Never mutate the one passed in.
//
// ============================================================================

export * from "./enums.js";
export * from "./survey.js";
export * from "./profile.js";
export * from "./reading.js";
export * from "./insights.js";
