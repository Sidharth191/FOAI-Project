// ============================================================================
// P3 — WEATHER SERVICE          STATUS: STUB (written by P4)
// ----------------------------------------------------------------------------
// P3: replace the BODY of getReading. Do not touch the signature, the export
// name, or the shape of what comes back. The rest of the app already calls this.
// Delete the mock import when you're done.
// ============================================================================
import { EMPTY_READING, failedReading, validateReading } from "../../contracts/index.js";
import { mockReading, mockReadingB } from "../../data/mockData.js";

const FAKE_LATENCY_MS = 700;

/**
 * @param {{id: string, latitude: number, longitude: number}} location
 * @returns {Promise<import('../../contracts/reading.js').Reading>}
 */
export async function getReading(location) {
  await new Promise((r) => setTimeout(r, FAKE_LATENCY_MS));

  // ---- STUB BODY: delete everything below and fetch Open-Meteo ----
  try {
    const base = location.id === "chennai" ? mockReadingB : mockReading;
    const reading = { ...EMPTY_READING, ...base, locationId: location.id, fetchedAt: new Date().toISOString() };

    if (import.meta.env.DEV) {
      const errs = validateReading(reading);
      if (errs.length) console.warn("[weather] contract violation:", errs);
    }
    return reading;
  } catch (e) {
    return failedReading(location.id, "UNKNOWN", e.message);
  }
  // ---- END STUB BODY ----
}
