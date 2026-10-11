import React, { useState } from "react";
import PersonaSliders from "./components/PersonaSliders.jsx";
import ThresholdInputs from "./components/ThresholdInputs.jsx";
import LocationManager from "./components/LocationManager.jsx";
import PreferencesSection from "./components/PreferencesSection.jsx";
import { validateProfile, EMPTY_PROFILE } from "../../contracts/profile.js";

export default function Settings({ profile, onApplyProfile, onBack }) {
  // Fallback to safe default if profile is missing
  const defaultProfile = profile || {
    ...EMPTY_PROFILE,
    personas: [{ id: "fitness", weight: 100 }],
    locations: [{ id: "jaipur", name: "Jaipur", latitude: 26.91, longitude: 75.79, timezone: "Asia/Kolkata" }],
  };

  // Draft profile state for fluid editing
  const [draftProfile, setDraftProfile] = useState(() => JSON.parse(JSON.stringify(defaultProfile)));
  const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'

  // Derive validation errors directly during render (React 19 best practice)
  const validationErrors = draftProfile ? validateProfile(draftProfile) : [];
  const hasErrors = validationErrors.length > 0;

  const handlePersonasChange = (newPersonas) => {
    setDraftProfile((prev) => ({
      ...prev,
      personas: newPersonas,
    }));
  };

  const handleThresholdsChange = (newThresholds) => {
    setDraftProfile((prev) => ({
      ...prev,
      thresholds: newThresholds,
    }));
  };

  const handleSwitchLocation = (locationId) => {
    setDraftProfile((prev) => {
      const target = prev.locations.find((l) => l.id === locationId);
      if (!target) return prev;
      const rest = prev.locations.filter((l) => l.id !== locationId);
      return {
        ...prev,
        locations: [{ ...target }, ...rest.map((l) => ({ ...l }))],
      };
    });
  };

  const handleAddLocation = (newLoc) => {
    setDraftProfile((prev) => {
      const existing = prev.locations.find((l) => l.id === newLoc.id);
      if (existing) {
        const rest = prev.locations.filter((l) => l.id !== newLoc.id);
        return {
          ...prev,
          locations: [{ ...existing }, ...rest.map((l) => ({ ...l }))],
        };
      }
      return {
        ...prev,
        locations: [{ ...newLoc }, ...prev.locations.map((l) => ({ ...l }))],
      };
    });
  };

  const handleRemoveLocation = (locationId) => {
    setDraftProfile((prev) => {
      if (prev.locations.length <= 1) return prev;
      return {
        ...prev,
        locations: prev.locations.filter((l) => l.id !== locationId).map((l) => ({ ...l })),
      };
    });
  };

  const handleLanguageChange = (lang) => {
    setDraftProfile((prev) => ({
      ...prev,
      language: lang,
    }));
  };

  const handleReset = () => {
    setDraftProfile(JSON.parse(JSON.stringify(defaultProfile)));
    setSaveStatus(null);
  };

  const handleApply = async () => {
    // Sort personas by weight descending as required by the contract
    const sortedPersonas = [...draftProfile.personas].sort((a, b) => (b.weight || 0) - (a.weight || 0));

    const finalProfile = {
      ...draftProfile,
      personas: sortedPersonas,
    };

    const errors = validateProfile(finalProfile);
    if (errors.length > 0) {
      setSaveStatus("error");
      return;
    }

    setDraftProfile(finalProfile);

    try {
      if (typeof onApplyProfile === "function") {
        await onApplyProfile(finalProfile);
      }
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      console.error("Failed to apply profile:", err);
      setSaveStatus("error");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F14] p-4 sm:p-6 text-left text-[#E8ECF1]">
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        {/* Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg border border-[#2A3441] bg-[#151B24] px-3 py-2 text-sm font-medium text-[#E8ECF1] shadow-sm transition hover:bg-[#2A3441]"
            >
              <span>← Back</span>
            </button>
            <div>
              <h1 className="my-0 text-xl font-bold tracking-tight text-[#E8ECF1] sm:text-2xl">
                Profile & Weather Settings
              </h1>
              <p className="text-xs text-[#8B93A1]">
                Customize your weather personas, alert thresholds, and locations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-[#2A3441] bg-[#151B24] px-3 py-2 text-xs font-medium text-[#8B93A1] transition hover:border-[#3B4858] hover:text-[#E8ECF1]"
            >
              Discard Changes
            </button>
            <button
              type="button"
              disabled={hasErrors}
              onClick={handleApply}
              className="rounded-lg border border-purple-500/50 bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save & Apply
            </button>
          </div>
        </header>

        {/* Feedback / Notification Banners */}
        {saveStatus === "success" && (
          <div
            role="status"
            className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300"
          >
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Profile settings saved and applied to your weather dashboard.</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveStatus(null)}
              className="text-xs text-emerald-400 hover:text-emerald-200"
            >
              ✕
            </button>
          </div>
        )}

        {hasErrors && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300 space-y-1"
          >
            <div className="font-semibold">Please resolve contract validation issues before saving:</div>
            <ul className="list-disc pl-5 space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 1: Persona Weight Sliders */}
        <PersonaSliders
          personas={draftProfile.personas || []}
          onChange={handlePersonasChange}
        />

        {/* Section 2: Personal Weather Thresholds */}
        <ThresholdInputs
          thresholds={draftProfile.thresholds || {}}
          onChange={handleThresholdsChange}
        />

        {/* Section 3: Locations */}
        <LocationManager
          locations={draftProfile.locations || []}
          onSwitchLocation={handleSwitchLocation}
          onAddLocation={handleAddLocation}
          onRemoveLocation={handleRemoveLocation}
        />

        {/* Section 4: Preferences & Units */}
        <PreferencesSection
          language={draftProfile.language || "en"}
          units={draftProfile.units || "metric"}
          version={draftProfile.version || 1}
          onChangeLanguage={handleLanguageChange}
        />

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-[#2A3441] bg-[#151B24]/95 p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                hasErrors ? "bg-rose-400" : "bg-emerald-400"
              }`}
            />
            <span className="text-xs text-[#8B93A1]">
              {hasErrors
                ? `${validationErrors.length} validation issue(s)`
                : "Profile configuration valid"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-[#2A3441] bg-[#0B0F14] px-3.5 py-1.5 text-xs font-medium text-[#E8ECF1] transition hover:bg-[#2A3441]"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              disabled={hasErrors}
              onClick={handleApply}
              className="rounded-lg border border-purple-500/50 bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save & Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
