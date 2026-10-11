import React from "react";
import { LANGUAGES } from "../../../contracts/enums.js";

const LANGUAGE_LABELS = {
  en: { label: "English", native: "English" },
  ta: { label: "Tamil", native: "தமிழ்" },
  hi: { label: "Hindi", native: "हिन्दी" },
};

export default function PreferencesSection({
  language = "en",
  units = "metric",
  version = 1,
  onChangeLanguage,
}) {
  return (
    <section className="rounded-xl border border-[#2A3441] bg-[#151B24] p-5 shadow-sm">
      <div className="border-b border-[#2A3441] pb-4">
        <h3 className="text-base font-semibold text-[#E8ECF1]">App Preferences & Units</h3>
        <p className="text-xs text-[#8B93A1]">
          Display language and units configuration.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Language Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">
            Preferred Language
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {LANGUAGES.map((langKey) => {
              const isSelected = language === langKey;
              const langInfo = LANGUAGE_LABELS[langKey] || { label: langKey, native: langKey };

              return (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => onChangeLanguage(langKey)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/20 text-[#E8ECF1] shadow-sm"
                      : "border-[#2A3441] bg-[#0B0F14]/60 text-[#8B93A1] hover:border-[#3B4858] hover:text-[#E8ECF1]"
                  }`}
                >
                  <span className="text-sm font-semibold">{langInfo.native}</span>
                  <span className="text-[10px] text-[#8B93A1]">{langInfo.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Units Configuration */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">
            Measurement Units
          </label>
          <div className="mt-2 rounded-lg border border-[#2A3441] bg-[#0B0F14]/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#E8ECF1]">System Units</span>
              <span className="rounded-md border border-[#2A3441] bg-[#151B24] px-2 py-0.5 font-mono text-xs text-[#E8ECF1]">
                {units} (°C, km/h, mm)
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8B93A1]">
              KAIROS v{version} uses standardized metric units for precise cross-persona thresholds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
