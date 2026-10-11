// ============================================================================
// P7 — PROFILE / LOCATIONS SERVICE
// ----------------------------------------------------------------------------
// NEVER mutate the profile object. Always return a new object.
// switchLocation / addLocation does NOT fetch weather — useKairos handles it.
// ============================================================================
import { validateProfile } from "../../contracts/index.js";

/**
 * Updates profile fields immutably and validates the result.
 * @param {import('../../contracts/profile.js').Profile} profile
 * @param {Partial<import('../../contracts/profile.js').Profile>} changes
 * @returns {Promise<import('../../contracts/profile.js').Profile>}
 */
export async function updateProfile(profile, changes) {
  if (!profile) return profile;

  const next = {
    ...profile,
    ...changes,
    thresholds: changes.thresholds
      ? { ...profile.thresholds, ...changes.thresholds }
      : { ...profile.thresholds },
    personaDetails: changes.personaDetails
      ? { ...profile.personaDetails, ...changes.personaDetails }
      : { ...profile.personaDetails },
    personas: changes.personas
      ? changes.personas.map((p) => ({ ...p }))
      : profile.personas?.map((p) => ({ ...p })) || [],
    locations: changes.locations
      ? changes.locations.map((l) => ({ ...l }))
      : profile.locations?.map((l) => ({ ...l })) || [],
  };

  if (import.meta.env?.DEV) {
    const errs = validateProfile(next);
    if (errs.length) console.warn("[profile] contract violation in updateProfile:", errs);
  }
  return next;
}

/**
 * Moves the location with locationId to index 0 (active).
 * @param {import('../../contracts/profile.js').Profile} profile
 * @param {string} locationId
 * @returns {Promise<import('../../contracts/profile.js').Profile>}
 */
export async function switchLocation(profile, locationId) {
  if (!profile || !Array.isArray(profile.locations)) return profile;

  const target = profile.locations.find((l) => l.id === locationId);
  if (!target) return profile;

  const rest = profile.locations.filter((l) => l.id !== locationId);
  const next = {
    ...profile,
    locations: [{ ...target }, ...rest.map((l) => ({ ...l }))],
  };

  if (import.meta.env?.DEV) {
    const errs = validateProfile(next);
    if (errs.length) console.warn("[profile] contract violation in switchLocation:", errs);
  }
  return next;
}

/**
 * Adds a new location to index 0 (active) or activates it if already present.
 * @param {import('../../contracts/profile.js').Profile} profile
 * @param {import('../../contracts/profile.js').ProfileLocation} location
 * @returns {Promise<import('../../contracts/profile.js').Profile>}
 */
export async function addLocation(profile, location) {
  if (!profile || !location) return profile;

  if (profile.locations?.some((l) => l.id === location.id)) {
    return switchLocation(profile, location.id);
  }

  const next = {
    ...profile,
    locations: [{ ...location }, ...(profile.locations || []).map((l) => ({ ...l }))],
  };

  if (import.meta.env?.DEV) {
    const errs = validateProfile(next);
    if (errs.length) console.warn("[profile] contract violation in addLocation:", errs);
  }
  return next;
}

/**
 * Removes a location by ID (maintains at least 1 location).
 * @param {import('../../contracts/profile.js').Profile} profile
 * @param {string} locationId
 * @returns {Promise<import('../../contracts/profile.js').Profile>}
 */
export async function removeLocation(profile, locationId) {
  if (!profile || !Array.isArray(profile.locations) || profile.locations.length <= 1) {
    return profile;
  }

  const nextLocations = profile.locations
    .filter((l) => l.id !== locationId)
    .map((l) => ({ ...l }));

  const next = {
    ...profile,
    locations: nextLocations,
  };

  if (import.meta.env?.DEV) {
    const errs = validateProfile(next);
    if (errs.length) console.warn("[profile] contract violation in removeLocation:", errs);
  }
  return next;
}
