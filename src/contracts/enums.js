// KAIROS — FROZEN ENUMS
// Owner: Person 4. Nobody adds/renames/re-cases a value here without telling P4.
// Every string ID that crosses a module boundary MUST come from this file.

export const PERSONA_IDS = [
  "fitness",
  "health",
  "farmer",
  "parent",
  "commuter",
  "outdoor",
  "elderly",
];

export const ACTIVITY_IDS = [
  "running",
  "cycling",
  "walking",
  "gym",
  "sports",
  "gardening",
  "fieldwork",
  "commute",
];

// reading.condition — the ONLY allowed values. Weather service maps
// whatever the API returns onto this list. UI maps this list onto icons.
export const CONDITIONS = [
  "clear",
  "partly_cloudy",
  "cloudy",
  "fog",
  "drizzle",
  "rain",
  "heavy_rain",
  "thunderstorm",
  "snow",
  "unknown",
];

// pollen / generic qualitative levels
export const LEVELS = ["low", "moderate", "high", "very_high"];

// alert.severity — drives colour + sort order on the homepage
export const SEVERITIES = ["critical", "warning", "info"];

export const LANGUAGES = ["en", "ta", "hi"];

// Error codes returned inside reading.error / insights.error
export const ERROR_CODES = [
  "NETWORK",
  "RATE_LIMIT",
  "BAD_LOCATION",
  "AI_FAILED",
  "TIMEOUT",
  "UNKNOWN",
];

export const CONTRACT_VERSION = 1;
