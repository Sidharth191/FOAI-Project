// ============================================================================
// P4 ONLY — the single place where the whole KAIROS chain is wired together.
// Nobody else edits this file. If you think you need to, message P4.
//
//   survey -> generateProfile -> getReading -> generateInsights -> Homepage
//
// The refresh sequence lives here so there is exactly ONE path that updates the
// homepage. Settings does not fetch weather. Homepage does not call an API.
// ============================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { getSurveyAnswers } from "../services/survey/index.js";
import { generateProfile, generateInsights } from "../services/ai/index.js";
import { getReading } from "../services/weather/index.js";
import { cacheGet, cacheSet } from "../services/cache/index.js";

export const SCREENS = {
  WELCOME: "welcome",
  SURVEY: "survey",
  PROCESSING: "processing",
  CONFIRM: "confirm",
  HOMEPAGE: "homepage",
  SETTINGS: "settings",
};

export function useKairos() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [profile, setProfile] = useState(null);
  const [reading, setReading] = useState(null);
  const [insights, setInsights] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // RACE GUARD. The user taps Delhi then Mumbai in half a second. Delhi's slower
  // response lands last and overwrites Mumbai. This counter throws away any
  // response that is not from the most recent request.
  const requestId = useRef(0);

  /** Fetch reading + insights for profile.locations[0]. The only refresh path. */
  const refresh = useCallback(async (activeProfile, { useCache = true } = {}) => {
    if (!activeProfile?.locations?.length) return;
    const location = activeProfile.locations[0];
    const myId = ++requestId.current;

    setStatus("loading");

    // Serve cache instantly if we have it, then refresh underneath.
    if (useCache) {
      const cached = await cacheGet(`reading:${location.id}`);
      if (cached && requestId.current === myId) {
        setReading({ ...cached, stale: true });
      }
    }

    const nextReading = await getReading({
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // Response for a location the user already left, or an older request. Drop it.
    if (requestId.current !== myId) return;
    if (nextReading.locationId !== location.id) return;

    setReading(nextReading);
    if (!nextReading.error) await cacheSet(`reading:${location.id}`, nextReading, 600);

    const nextInsights = await generateInsights(activeProfile, nextReading);
    if (requestId.current !== myId) return;

    setInsights(nextInsights);
    setStatus(nextReading.error && !nextReading.tempC ? "error" : "ready");
  }, []);

  /** Called by P1's survey screen when it finishes. */
  const completeSurvey = useCallback(async () => {
    setScreen(SCREENS.PROCESSING);
    const answers = await getSurveyAnswers();
    const nextProfile = await generateProfile(answers);
    setProfile(nextProfile);
    setScreen(SCREENS.CONFIRM);
  }, []);

  /** Called from the confirmation screen. */
  const confirmProfile = useCallback(async () => {
    setScreen(SCREENS.HOMEPAGE);
    await refresh(profile);
  }, [profile, refresh]);

  /**
   * Called by P7's Settings. P7 hands back a NEW profile; we detect the change
   * and refetch. This is why switchLocation must not fetch weather itself —
   * two refresh paths means two competing renders.
   */
  const applyProfile = useCallback(
    async (nextProfile) => {
      setProfile(nextProfile);
      await refresh(nextProfile);
    },
    [refresh]
  );

  // DEV: skip straight to a populated homepage. ?demo=1 in the URL.
  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("demo")) {
      completeSurvey();
    }
  }, [completeSurvey]);

  return {
    screen,
    setScreen,
    profile,
    reading,
    insights,
    status,
    completeSurvey,
    confirmProfile,
    applyProfile,
    refresh: () => refresh(profile, { useCache: false }),
  };
}
