import HomepageStates from "../../components/homepage/HomepageStates.jsx";
import { EMPTY_READING, ERROR_CODES } from "../../contracts";
import { mockInsights, mockReading } from "../../data/mockData";

const UNKNOWN_CONDITION = EMPTY_READING.condition;
const NETWORK_CODE = ERROR_CODES[0];

function populatedReading(overrides = {}) {
  return { ...mockReading, forecast: mockReading.forecast.map((day) => ({ ...day })), ...overrides };
}

function populatedInsights(overrides = {}) {
  return {
    ...mockInsights,
    alerts: mockInsights.alerts.map((alert) => ({ ...alert })),
    cards: mockInsights.cards.map((card) => ({ ...card })),
    ...overrides,
  };
}

function allNullReading() {
  return {
    ...EMPTY_READING,
    fetchedAt: mockReading.fetchedAt,
    locationId: mockReading.locationId,
    forecast: mockReading.forecast.map((day) => ({
      date: day.date,
      tempMaxC: null,
      tempMinC: null,
      condition: UNKNOWN_CONDITION,
      rainProbPct: null,
      uvMax: null,
    })),
  };
}

function applyDevTestState(testState, reading, insights, status) {
  switch (testState) {
    case "loading":
      return { reading: null, insights, status: "loading" };
    case "stale":
      return {
        reading: populatedReading({ stale: true }),
        insights: insights ?? populatedInsights(),
        status: "ready",
      };
    case "error":
      return {
        reading: {
          ...EMPTY_READING,
          fetchedAt: mockReading.fetchedAt,
          locationId: mockReading.locationId,
          stale: true,
          source: "cache",
          tempC: null,
          error: { code: NETWORK_CODE, message: "Could not load weather." },
        },
        insights,
        status: "error",
      };
    case "rulesFallback":
      return {
        reading: reading ?? populatedReading(),
        insights: populatedInsights({ source: "rules" }),
        status: status === "idle" ? "ready" : status,
      };
    case "noAlerts":
      return {
        reading: reading ?? populatedReading(),
        insights: populatedInsights({ alerts: [] }),
        status: status === "idle" ? "ready" : status,
      };
    case "allNull":
      return {
        reading: allNullReading(),
        insights: insights ?? populatedInsights({ alerts: [] }),
        status: "ready",
      };
    default:
      return { reading, insights, status };
  }
}

export default function Homepage({
  profile,
  reading,
  insights,
  status,
  onRefresh,
  onOpenSettings,
}) {
  let nextReading = reading;
  let nextInsights = insights;
  let nextStatus = status;

  if (import.meta.env.DEV) {
    const testState = new URLSearchParams(window.location.search).get("testState");
    if (testState) {
      const overridden = applyDevTestState(testState, reading, insights, status);
      nextReading = overridden.reading;
      nextInsights = overridden.insights;
      nextStatus = overridden.status;
    }
  }

  return (
    <HomepageStates
      profile={profile}
      reading={nextReading}
      insights={nextInsights}
      status={nextStatus}
      onRefresh={onRefresh}
      onOpenSettings={onOpenSettings}
    />
  );
}
