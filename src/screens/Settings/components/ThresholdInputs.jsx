import React from "react";
import { EMPTY_THRESHOLDS } from "../../../contracts/profile.js";

const THRESHOLD_GROUPS = [
  {
    title: "Temperature & Thermal Comfort",
    icon: "🌡️",
    description: "Triggers alerts when temperatures cross your comfortable range.",
    fields: [
      { key: "tempMaxC", label: "Max Temperature", unit: "°C", step: "1", min: "-20", max: "60", placeholder: "e.g. 38" },
      { key: "tempMinC", label: "Min Temperature", unit: "°C", step: "1", min: "-30", max: "40", placeholder: "e.g. 4" },
      { key: "feelsLikeMaxC", label: "Max Feels-Like", unit: "°C", step: "1", min: "-20", max: "65", placeholder: "e.g. 42" },
    ],
  },
  {
    title: "Air Quality & Solar UV",
    icon: "☀️",
    description: "Alert thresholds for sun exposure and atmospheric pollution.",
    fields: [
      { key: "aqiMax", label: "Max AQI Index", unit: "AQI", step: "1", min: "0", max: "500", placeholder: "e.g. 150" },
      { key: "uvMax", label: "Max UV Index", unit: "UV", step: "0.5", min: "0", max: "15", placeholder: "e.g. 8" },
    ],
  },
  {
    title: "Precipitation & Wind",
    icon: "🌧️",
    description: "Conditions affecting commute, cycling, and travel safety.",
    fields: [
      { key: "rainProbMaxPct", label: "Rain Probability Alert", unit: "%", step: "5", min: "0", max: "100", placeholder: "e.g. 70" },
      { key: "windMaxKph", label: "Max Wind Speed", unit: "km/h", step: "1", min: "0", max: "150", placeholder: "e.g. 45" },
    ],
  },
  {
    title: "Soil & Environment",
    icon: "🌾",
    description: "Specialized metrics for agriculture, gardening, and driving visibility.",
    fields: [
      { key: "soilMoistureMinPct", label: "Min Soil Moisture", unit: "%", step: "1", min: "0", max: "100", placeholder: "e.g. 20" },
      { key: "humidityMaxPct", label: "Max Humidity", unit: "%", step: "1", min: "0", max: "100", placeholder: "e.g. 85" },
      { key: "visibilityMinKm", label: "Min Visibility", unit: "km", step: "0.5", min: "0", max: "50", placeholder: "e.g. 2" },
    ],
  },
];

export default function ThresholdInputs({ thresholds = {}, onChange }) {
  const currentThresholds = { ...EMPTY_THRESHOLDS, ...thresholds };

  const handleFieldChange = (key, rawValue) => {
    const trimmed = rawValue.trim();
    let nextVal = null;
    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
      nextVal = Number(trimmed);
    }

    onChange({
      ...currentThresholds,
      [key]: nextVal,
    });
  };

  const handleClearField = (key) => {
    onChange({
      ...currentThresholds,
      [key]: null,
    });
  };

  const handleResetAll = () => {
    onChange({ ...EMPTY_THRESHOLDS });
  };

  const activeCount = Object.values(currentThresholds).filter((v) => v !== null).length;

  return (
    <section className="rounded-xl border border-[#2A3441] bg-[#151B24] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-4">
        <div>
          <h3 className="text-base font-semibold text-[#E8ECF1]">Personal Weather Thresholds</h3>
          <p className="text-xs text-[#8B93A1]">
            Alerts fire when local readings breach these values. Cleared fields are disabled (null).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-300">
            {activeCount} active / 10
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="rounded-lg border border-[#2A3441] bg-[#0B0F14] px-2.5 py-1 text-xs text-[#8B93A1] transition hover:text-rose-300"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {THRESHOLD_GROUPS.map((group) => (
          <div key={group.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{group.icon}</span>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8ECF1]">
                  {group.title}
                </h4>
                <p className="text-[11px] text-[#8B93A1]">{group.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.fields.map((field) => {
                const val = currentThresholds[field.key];
                const isSet = val !== null && val !== undefined;

                return (
                  <div
                    key={field.key}
                    className={`relative rounded-lg border p-3 transition-colors ${
                      isSet
                        ? "border-[#3B4858] bg-[#0B0F14]/80"
                        : "border-[#2A3441]/60 bg-[#0B0F14]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 pb-1.5">
                      <label
                        htmlFor={`input-${field.key}`}
                        className="text-xs font-medium text-[#E8ECF1]"
                      >
                        {field.label}
                      </label>
                      {isSet && (
                        <button
                          type="button"
                          onClick={() => handleClearField(field.key)}
                          title="Clear threshold"
                          className="rounded px-1 text-[10px] text-[#8B93A1] transition hover:bg-rose-500/20 hover:text-rose-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      <input
                        id={`input-${field.key}`}
                        type="number"
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        value={isSet ? val : ""}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full rounded-md border border-[#2A3441] bg-[#151B24] py-1.5 pl-2.5 pr-12 font-mono text-sm text-[#E8ECF1] placeholder-[#535D6C] focus:border-purple-500 focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-2.5 rounded bg-[#2A3441]/50 px-1.5 py-0.5 text-[11px] font-medium text-[#8B93A1]">
                        {field.unit}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-[#8B93A1]">
                      <span>{isSet ? `Alert trigger: ${val} ${field.unit}` : "Disabled (null)"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
