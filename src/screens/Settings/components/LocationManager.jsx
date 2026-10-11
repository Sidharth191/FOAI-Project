import React, { useState } from "react";

const PRESET_LOCATIONS = [
  { id: "jaipur", name: "Jaipur", latitude: 26.91, longitude: 75.79, timezone: "Asia/Kolkata" },
  { id: "chennai", name: "Chennai", latitude: 13.08, longitude: 80.27, timezone: "Asia/Kolkata" },
  { id: "delhi", name: "Delhi", latitude: 28.61, longitude: 77.2, timezone: "Asia/Kolkata" },
  { id: "mumbai", name: "Mumbai", latitude: 19.07, longitude: 72.87, timezone: "Asia/Kolkata" },
  { id: "bengaluru", name: "Bengaluru", latitude: 12.97, longitude: 77.59, timezone: "Asia/Kolkata" },
  { id: "kolkata", name: "Kolkata", latitude: 22.57, longitude: 88.36, timezone: "Asia/Kolkata" },
  { id: "hyderabad", name: "Hyderabad", latitude: 17.38, longitude: 78.48, timezone: "Asia/Kolkata" },
  { id: "shimla", name: "Shimla", latitude: 31.1, longitude: 77.17, timezone: "Asia/Kolkata" },
];

export default function LocationManager({
  locations = [],
  onSwitchLocation,
  onAddLocation,
  onRemoveLocation,
}) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [customTimezone, setCustomTimezone] = useState("Asia/Kolkata");
  const [formError, setFormError] = useState("");

  const activeLocation = locations[0] || null;
  const savedLocationIds = new Set(locations.map((l) => l.id));

  const handleAddPreset = (preset) => {
    onAddLocation(preset);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    setFormError("");

    const name = customName.trim();
    if (!name) {
      setFormError("Location name is required.");
      return;
    }

    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setFormError("Latitude must be a valid number between -90 and 90.");
      return;
    }

    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setFormError("Longitude must be a valid number between -180 and 180.");
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newLoc = {
      id: slug || `loc-${Date.now()}`,
      name,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      timezone: customTimezone.trim() || null,
    };

    onAddLocation(newLoc);
    setCustomName("");
    setCustomLat("");
    setCustomLon("");
    setShowCustomForm(false);
  };

  return (
    <section className="rounded-xl border border-[#2A3441] bg-[#151B24] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-4">
        <div>
          <h3 className="text-base font-semibold text-[#E8ECF1]">Location Management</h3>
          <p className="text-xs text-[#8B93A1]">
            The top location is always active. Tap any saved location to switch to it.
          </p>
        </div>
        {activeLocation && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Active: {activeLocation.name}</span>
          </div>
        )}
      </div>

      {/* Saved Locations List */}
      <div className="mt-4 space-y-2.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">
          Saved Locations ({locations.length})
        </h4>
        <div className="space-y-2">
          {locations.map((loc, idx) => {
            const isActive = idx === 0;

            return (
              <div
                key={loc.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 transition-all ${
                  isActive
                    ? "border-purple-500/60 bg-purple-500/10 shadow-sm"
                    : "border-[#2A3441] bg-[#0B0F14]/60 hover:border-[#3B4858]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A3441]/40 text-sm">
                    {isActive ? "📍" : "🏙️"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#E8ECF1]">{loc.name}</span>
                      {isActive && (
                        <span className="rounded-full bg-purple-500 px-2 py-0.2 text-[10px] font-bold uppercase tracking-wide text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-[#8B93A1]">
                      {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                      {loc.timezone ? ` • ${loc.timezone}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSwitchLocation(loc.id)}
                      className="rounded-lg border border-[#2A3441] bg-[#151B24] px-3 py-1.5 text-xs font-medium text-[#E8ECF1] transition hover:border-purple-500 hover:text-purple-300"
                    >
                      Make Active
                    </button>
                  )}
                  {locations.length > 1 && (
                    <button
                      type="button"
                      title="Remove saved location"
                      onClick={() => onRemoveLocation(loc.id)}
                      className="rounded p-1.5 text-xs text-[#8B93A1] transition hover:bg-rose-500/20 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Cities */}
      <div className="mt-5 border-t border-[#2A3441] pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">
          Quick Presets (India)
        </h4>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PRESET_LOCATIONS.map((preset) => {
            const isSaved = savedLocationIds.has(preset.id);
            const isActive = activeLocation?.id === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-purple-500 bg-purple-500/20 text-purple-200"
                    : isSaved
                    ? "border-[#2A3441] bg-[#0B0F14] text-[#E8ECF1] hover:border-purple-500/50"
                    : "border-[#2A3441] bg-[#151B24] text-[#8B93A1] hover:border-[#3B4858] hover:text-[#E8ECF1]"
                }`}
              >
                <span>{preset.name}</span>
                {isActive && <span className="text-[10px] text-purple-400">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Location Adder */}
      <div className="mt-5 border-t border-[#2A3441] pt-4">
        {!showCustomForm ? (
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-2 rounded-lg border border-[#2A3441] bg-[#0B0F14] px-3 py-2 text-xs font-medium text-[#E8ECF1] transition hover:border-purple-500 hover:text-purple-300"
          >
            <span>+ Add Custom Location / Coordinates</span>
          </button>
        ) : (
          <form onSubmit={handleAddCustom} className="rounded-lg border border-[#3B4858] bg-[#0B0F14] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
              <h5 className="text-xs font-semibold text-[#E8ECF1]">Add Custom Location</h5>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="text-xs text-[#8B93A1] hover:text-[#E8ECF1]"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <p className="rounded bg-rose-500/10 border border-rose-500/30 p-2 text-xs text-rose-300">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-medium text-[#8B93A1]">City / Place Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pune"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2A3441] bg-[#151B24] px-3 py-1.5 text-xs text-[#E8ECF1] placeholder-[#535D6C] focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#8B93A1]">Timezone</label>
                <input
                  type="text"
                  placeholder="Asia/Kolkata"
                  value={customTimezone}
                  onChange={(e) => setCustomTimezone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2A3441] bg-[#151B24] px-3 py-1.5 text-xs text-[#E8ECF1] placeholder-[#535D6C] focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#8B93A1]">Latitude (-90 to 90)</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g. 18.5204"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2A3441] bg-[#151B24] px-3 py-1.5 text-xs font-mono text-[#E8ECF1] placeholder-[#535D6C] focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#8B93A1]">Longitude (-180 to 180)</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g. 73.8567"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2A3441] bg-[#151B24] px-3 py-1.5 text-xs font-mono text-[#E8ECF1] placeholder-[#535D6C] focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="rounded-lg border border-[#2A3441] bg-[#151B24] px-3 py-1.5 text-xs text-[#8B93A1] hover:text-[#E8ECF1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg border border-purple-500/40 bg-purple-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-purple-500"
              >
                Add & Activate Location
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
