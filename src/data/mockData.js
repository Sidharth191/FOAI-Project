// KAIROS — SHARED MOCK DATA
// Owner: Person 4. This file is the reason nobody has to wait for anybody.
// Every module imports from here on day one and swaps in the real service later.
//
// SCENARIO A ("stress")  = Farmer + Parent, Jaipur, brutal weather. Alerts must fire.
// SCENARIO B ("calm")    = Fitness + Health, Chennai, normal weather. Different homepage.
//
// If your module works against BOTH scenarios, integration will work.

// ─────────────────────────── SCENARIO A: SURVEY ───────────────────────────
export const mockSurveyAnswers = {
  version: 1,
  completedAt: "2026-08-26T03:30:00.000Z",
  location: {
    name: "Jaipur",
    latitude: 26.91,
    longitude: 75.79,
    country: "IN",
    timezone: "Asia/Kolkata",
  },
  interests: ["farmer", "parent"],
  activities: ["fieldwork", "commute"],
  personaDetails: {
    farmer: { crop: "wheat", stage: "sowing", fieldSizeAcres: 4 },
    parent: { childAgeYears: 7, schoolTime: "08:15" },
  },
  preferences: { language: "en", units: "metric" },
};

export const mockSurveyAnswersB = {
  version: 1,
  completedAt: "2026-08-26T03:30:00.000Z",
  location: {
    name: "Chennai",
    latitude: 13.08,
    longitude: 80.27,
    country: "IN",
    timezone: "Asia/Kolkata",
  },
  interests: ["fitness", "health"],
  activities: ["running"],
  personaDetails: {
    fitness: { activity: "running", preferredTime: "06:00" },
    health: { conditions: ["asthma"] },
  },
  preferences: { language: "en", units: "metric" },
};

// ─────────────────────────── SCENARIO A: PROFILE ──────────────────────────
export const mockProfile = {
  version: 1,
  createdAt: "2026-08-26T03:31:00.000Z",
  personas: [
    { id: "farmer", weight: 60 },
    { id: "parent", weight: 40 },
  ],
  thresholds: {
    uvMax: 8,
    aqiMax: 150,
    tempMaxC: 38,
    tempMinC: 4,
    feelsLikeMaxC: 42,
    humidityMaxPct: null,
    windMaxKph: 45,
    rainProbMaxPct: 70,
    soilMoistureMinPct: 20,
    visibilityMinKm: 2,
  },
  locations: [
    { id: "jaipur", name: "Jaipur", latitude: 26.91, longitude: 75.79, timezone: "Asia/Kolkata" },
  ],
  personaDetails: {
    farmer: { crop: "wheat", stage: "sowing", fieldSizeAcres: 4 },
    parent: { childAgeYears: 7, schoolTime: "08:15" },
  },
  language: "en",
  units: "metric",
};

export const mockProfileB = {
  version: 1,
  createdAt: "2026-08-26T03:31:00.000Z",
  personas: [
    { id: "fitness", weight: 70 },
    { id: "health", weight: 30 },
  ],
  thresholds: {
    uvMax: 7,
    aqiMax: 100,
    tempMaxC: 35,
    tempMinC: null,
    feelsLikeMaxC: 38,
    humidityMaxPct: 85,
    windMaxKph: 30,
    rainProbMaxPct: 60,
    soilMoistureMinPct: null,
    visibilityMinKm: null,
  },
  locations: [
    { id: "chennai", name: "Chennai", latitude: 13.08, longitude: 80.27, timezone: "Asia/Kolkata" },
  ],
  personaDetails: {
    fitness: { activity: "running", preferredTime: "06:00" },
    health: { conditions: ["asthma"] },
  },
  language: "en",
  units: "metric",
};

// ─────────────────────────── SCENARIO A: READING ──────────────────────────
export const mockReading = {
  version: 1,
  fetchedAt: "2026-08-26T04:00:00.000Z",
  locationId: "jaipur",
  units: "metric",
  tempC: 41,
  feelsLikeC: 45,
  humidityPct: 22,
  windKph: 18,
  windDirDeg: 240,
  condition: "clear",
  uv: 11,
  aqi: 210,
  pm25: 118,
  pollen: "high",
  rainProbPct: 5,
  precipMm: 0,
  visibilityKm: 6,
  soilMoisturePct: 9,
  frost: false,
  fog: false,
  sunrise: "05:58",
  sunset: "18:25",
  waveM: null,
  waterTempC: null,
  forecast: [
    { date: "2026-08-27", tempMaxC: 42, tempMinC: 29, condition: "clear", rainProbPct: 5, uvMax: 11 },
    { date: "2026-08-28", tempMaxC: 40, tempMinC: 28, condition: "partly_cloudy", rainProbPct: 20, uvMax: 10 },
    { date: "2026-08-29", tempMaxC: 36, tempMinC: 27, condition: "rain", rainProbPct: 75, uvMax: 7 },
  ],
  stale: false,
  source: "mock",
  error: null,
};

export const mockReadingB = {
  version: 1,
  fetchedAt: "2026-08-26T04:00:00.000Z",
  locationId: "chennai",
  units: "metric",
  tempC: 28,
  feelsLikeC: 30,
  humidityPct: 65,
  windKph: 12,
  windDirDeg: 90,
  condition: "partly_cloudy",
  uv: 3,
  aqi: 55,
  pm25: 21,
  pollen: "moderate",
  rainProbPct: 20,
  precipMm: 0,
  visibilityKm: 10,
  soilMoisturePct: null,
  frost: false,
  fog: false,
  sunrise: "05:58",
  sunset: "18:25",
  waveM: 0.8,
  waterTempC: 29,
  forecast: [
    { date: "2026-08-27", tempMaxC: 32, tempMinC: 26, condition: "partly_cloudy", rainProbPct: 25, uvMax: 8 },
    { date: "2026-08-28", tempMaxC: 33, tempMinC: 26, condition: "cloudy", rainProbPct: 40, uvMax: 6 },
    { date: "2026-08-29", tempMaxC: 31, tempMinC: 25, condition: "rain", rainProbPct: 80, uvMax: 5 },
  ],
  stale: false,
  source: "mock",
  error: null,
};

// ─────────────────────────── SCENARIO A: INSIGHTS ─────────────────────────
export const mockInsights = {
  version: 1,
  generatedAt: "2026-08-26T04:00:05.000Z",
  locationId: "jaipur",
  headline: "Extreme heat and poor air — keep field work and school run early.",
  alerts: [
    {
      id: "feelslike-extreme",
      severity: "critical",
      personaId: "farmer",
      icon: "🔥",
      title: "Extreme heat",
      message: "Feels like 45°C. Stop field work between 11:00 and 16:00 and carry water.",
      metric: "feelsLikeC",
      value: 45,
    },
    {
      id: "aqi-poor",
      severity: "critical",
      personaId: "parent",
      icon: "😷",
      title: "Poor air quality",
      message: "AQI 210. Mask your child for the 08:15 school run and skip outdoor play.",
      metric: "aqi",
      value: 210,
    },
    {
      id: "uv-extreme",
      severity: "warning",
      personaId: "farmer",
      icon: "☀️",
      title: "Very high UV",
      message: "UV index 11. Cover up — burns start in under 10 minutes.",
      metric: "uv",
      value: 11,
    },
    {
      id: "soil-dry",
      severity: "warning",
      personaId: "farmer",
      icon: "🌱",
      title: "Soil too dry for sowing",
      message: "Soil moisture 9%, below the 20% you need. Irrigate before sowing wheat.",
      metric: "soilMoisturePct",
      value: 9,
    },
  ],
  cards: [
    {
      id: "farmer-sowing-window",
      personaId: "farmer",
      title: "Sowing window",
      body: "Rain likely Thursday (75%). Irrigate now, sow after the rain for better germination.",
      priority: 90,
      icon: "🌾",
    },
    {
      id: "parent-school-run",
      personaId: "parent",
      title: "School run",
      body: "08:15 departure is the coolest part of the day, but air is unhealthy — use a mask.",
      priority: 80,
      icon: "🎒",
    },
  ],
  source: "rules",
  error: null,
};

export const mockInsightsB = {
  version: 1,
  generatedAt: "2026-08-26T04:00:05.000Z",
  locationId: "chennai",
  headline: "Good running conditions this morning — humidity is the only catch.",
  alerts: [
    {
      id: "humidity-high",
      severity: "info",
      personaId: "fitness",
      icon: "💧",
      title: "Humid run",
      message: "65% humidity. Expect a slower pace and drink more than usual.",
      metric: "humidityPct",
      value: 65,
    },
  ],
  cards: [
    {
      id: "fitness-run-window",
      personaId: "fitness",
      title: "Best run window",
      body: "06:00 start is ideal — 28°C, UV only 3, air quality fine at AQI 55.",
      priority: 90,
      icon: "🏃",
    },
    {
      id: "health-asthma",
      personaId: "health",
      title: "Asthma check",
      body: "Pollen is moderate. Carry your inhaler but conditions are not a trigger today.",
      priority: 70,
      icon: "🫁",
    },
  ],
  source: "rules",
  error: null,
};

// Convenience: the location object P3's getReading() expects.
export const mockLocation = { id: "jaipur", latitude: 26.91, longitude: 75.79 };
export const mockLocationB = { id: "chennai", latitude: 13.08, longitude: 80.27 };
