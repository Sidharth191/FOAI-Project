// KAIROS CONTRACT — Reading  (v1)
// PRODUCED BY: Person 3 (getReading)   CONSUMED BY: Person 2 (insights), Person 4, Person 5
// FROZEN.
//
// RULE 1: every key below is ALWAYS present. Missing data === null.
//         Never 0. Never undefined. Never "N/A". Never omit the key.
// RULE 2: units are in the key name. tempC = Celsius. windKph = km/h. Never change.
// RULE 3: getReading NEVER throws and NEVER rejects. On failure it resolves to a
//         full-shaped Reading with null values, stale: true and error set.

/**
 * @typedef {Object} Reading
 * @property {number} version
 * @property {string} fetchedAt          ISO-8601 UTC
 * @property {string} locationId         echoes the ProfileLocation.id it was fetched for
 * @property {string} units              "metric"
 *
 * // --- current conditions ---
 * @property {number|null} tempC
 * @property {number|null} feelsLikeC
 * @property {number|null} humidityPct
 * @property {number|null} windKph
 * @property {number|null} windDirDeg
 * @property {string} condition          from CONDITIONS, "unknown" if unmappable
 *
 * // --- air & sun ---
 * @property {number|null} uv
 * @property {number|null} aqi
 * @property {number|null} pm25
 * @property {string|null} pollen        from LEVELS or null
 *
 * // --- water & visibility ---
 * @property {number|null} rainProbPct
 * @property {number|null} precipMm
 * @property {number|null} visibilityKm
 *
 * // --- ground ---
 * @property {number|null} soilMoisturePct
 * @property {boolean|null} frost
 * @property {boolean|null} fog
 *
 * // --- day markers: LOCAL time, 24h "HH:MM". Not "5:58 AM". ---
 * @property {string|null} sunrise
 * @property {string|null} sunset
 *
 * // --- coastal (null inland) ---
 * @property {number|null} waveM
 * @property {number|null} waterTempC
 *
 * @property {ForecastDay[]} forecast    ALWAYS an array. Empty [] if unavailable.
 * @property {boolean} stale             true if served from cache or fallback
 * @property {string} source             "open-meteo" | "cache" | "mock"
 * @property {ReadingError|null} error
 *
 * @typedef {Object} ForecastDay
 * @property {string} date               "YYYY-MM-DD"
 * @property {number|null} tempMaxC
 * @property {number|null} tempMinC
 * @property {string} condition          from CONDITIONS
 * @property {number|null} rainProbPct
 * @property {number|null} uvMax
 *
 * @typedef {Object} ReadingError
 * @property {string} code               from ERROR_CODES
 * @property {string} message            short, displayable
 */

export const EMPTY_READING = {
  version: 1,
  fetchedAt: null,
  locationId: null,
  units: "metric",
  tempC: null,
  feelsLikeC: null,
  humidityPct: null,
  windKph: null,
  windDirDeg: null,
  condition: "unknown",
  uv: null,
  aqi: null,
  pm25: null,
  pollen: null,
  rainProbPct: null,
  precipMm: null,
  visibilityKm: null,
  soilMoisturePct: null,
  frost: null,
  fog: null,
  sunrise: null,
  sunset: null,
  waveM: null,
  waterTempC: null,
  forecast: [],
  stale: false,
  source: "mock",
  error: null,
};

/** Person 3 uses this for the failure path so the shape can never drift. */
export function failedReading(locationId, code, message) {
  return {
    ...EMPTY_READING,
    fetchedAt: new Date().toISOString(),
    locationId,
    stale: true,
    source: "cache",
    error: { code, message },
  };
}

export function validateReading(r) {
  const errs = [];
  if (!r || typeof r !== "object") return ["reading is not an object"];
  Object.keys(EMPTY_READING).forEach((k) => {
    if (!(k in r)) errs.push(`reading.${k} missing (use null if unavailable)`);
    if (r[k] === undefined) errs.push(`reading.${k} is undefined — use null`);
  });
  if (!Array.isArray(r.forecast)) errs.push("forecast must be an array (use [] if none)");
  if (r.sunrise && !/^\d{2}:\d{2}$/.test(r.sunrise)) errs.push('sunrise must be "HH:MM" 24h');
  if (r.sunset && !/^\d{2}:\d{2}$/.test(r.sunset)) errs.push('sunset must be "HH:MM" 24h');
  return errs;
}
