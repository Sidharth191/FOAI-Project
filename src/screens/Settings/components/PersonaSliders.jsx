import React, { useState } from "react";
import { PERSONA_IDS } from "../../../contracts/enums.js";

const PERSONA_META = {
  fitness: {
    label: "Fitness & Training",
    icon: "🏃",
    accent: "accent-blue-400 text-blue-400",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  health: {
    label: "Health & Respiratory",
    icon: "🫁",
    accent: "accent-emerald-400 text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  farmer: {
    label: "Agriculture & Farming",
    icon: "🌾",
    accent: "accent-amber-400 text-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  parent: {
    label: "Parent & Family",
    icon: "🎒",
    accent: "accent-pink-400 text-pink-400",
    badge: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  },
  commuter: {
    label: "Daily Commuter",
    icon: "🚲",
    accent: "accent-cyan-400 text-cyan-400",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  outdoor: {
    label: "Outdoor Enthusiast",
    icon: "🏕️",
    accent: "accent-lime-400 text-lime-400",
    badge: "border-lime-500/30 bg-lime-500/10 text-lime-300",
  },
  elderly: {
    label: "Elderly & Sensitive Care",
    icon: "👴",
    accent: "accent-purple-400 text-purple-400",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  },
};

/**
 * Normalizes persona weights such that the modified slider is respected
 * and the remaining weights are proportionally scaled to always sum to 100%.
 */
function normalizeWeights(personas, changedIndex, newWeight) {
  const targetWeight = Math.max(0, Math.min(100, Math.round(newWeight)));
  if (personas.length <= 1) {
    return [{ ...personas[0], weight: 100 }];
  }

  const updated = personas.map((p, i) => ({
    ...p,
    weight: i === changedIndex ? targetWeight : p.weight,
  }));

  const remainingTarget = 100 - targetWeight;
  const otherIndices = personas.map((_, i) => i).filter((i) => i !== changedIndex);
  const otherCurrentSum = otherIndices.reduce((sum, i) => sum + personas[i].weight, 0);

  if (otherCurrentSum > 0) {
    otherIndices.forEach((i) => {
      const ratio = personas[i].weight / otherCurrentSum;
      updated[i].weight = Math.round(ratio * remainingTarget);
    });
  } else {
    const perOther = Math.floor(remainingTarget / otherIndices.length);
    otherIndices.forEach((i) => {
      updated[i].weight = perOther;
    });
  }

  // Absorb integer rounding diff onto the largest other weight
  const currentSum = updated.reduce((s, p) => s + p.weight, 0);
  const diff = 100 - currentSum;
  if (diff !== 0 && otherIndices.length > 0) {
    let bestIndex = otherIndices[0];
    for (const i of otherIndices) {
      if (updated[i].weight > updated[bestIndex].weight) {
        bestIndex = i;
      }
    }
    updated[bestIndex].weight = Math.max(0, updated[bestIndex].weight + diff);
  }

  return updated;
}

export default function PersonaSliders({ personas = [], onChange }) {
  const [selectedToAdd, setSelectedToAdd] = useState("");

  const activePersonaIds = new Set(personas.map((p) => p.id));
  const availableToAdd = PERSONA_IDS.filter((id) => !activePersonaIds.has(id));

  const totalWeight = personas.reduce((s, p) => s + (Number(p.weight) || 0), 0);

  const handleSliderChange = (index, value) => {
    const nextPersonas = normalizeWeights(personas, index, Number(value));
    onChange(nextPersonas);
  };

  const handleAddPersona = () => {
    if (!selectedToAdd) return;
    const initialWeight = Math.min(25, Math.floor(100 / (personas.length + 1)));
    const remainingRatio = (100 - initialWeight) / (totalWeight || 1);

    const scaledExisting = personas.map((p) => ({
      ...p,
      weight: Math.round(p.weight * remainingRatio),
    }));

    const newPersonaList = [...scaledExisting, { id: selectedToAdd, weight: initialWeight }];
    const fixedList = normalizeWeights(newPersonaList, newPersonaList.length - 1, initialWeight);

    onChange(fixedList);
    setSelectedToAdd("");
  };

  const handleRemovePersona = (idToRemove) => {
    if (personas.length <= 1) return;
    const remaining = personas.filter((p) => p.id !== idToRemove);
    const sumRemaining = remaining.reduce((s, p) => s + p.weight, 0);

    const rebalanced = remaining.map((p) => ({
      ...p,
      weight: sumRemaining > 0 ? Math.round((p.weight / sumRemaining) * 100) : Math.floor(100 / remaining.length),
    }));

    const diff = 100 - rebalanced.reduce((s, p) => s + p.weight, 0);
    if (diff !== 0 && rebalanced.length > 0) {
      rebalanced[0].weight += diff;
    }

    onChange(rebalanced);
  };

  return (
    <section className="rounded-xl border border-[#2A3441] bg-[#151B24] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-4">
        <div>
          <h3 className="text-base font-semibold text-[#E8ECF1]">Persona Weights</h3>
          <p className="text-xs text-[#8B93A1]">
            Tune the balance of personas. Weights automatically adjust to sum to 100%.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            Math.abs(totalWeight - 100) <= 1
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
        >
          <span>Total: {totalWeight}%</span>
          {Math.abs(totalWeight - 100) <= 1 ? "✓" : "⚠️"}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {personas.map((persona, index) => {
          const meta = PERSONA_META[persona.id] || {
            label: persona.id,
            icon: "👤",
            accent: "accent-purple-400 text-purple-400",
            badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
          };

          return (
            <div
              key={persona.id}
              className="rounded-lg border border-[#2A3441]/80 bg-[#0B0F14]/60 p-3.5 transition-colors hover:border-[#3B4858]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg" aria-hidden="true">
                    {meta.icon}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-[#E8ECF1]">{meta.label}</span>
                    <span className="ml-2 text-xs uppercase tracking-wider text-[#8B93A1]">
                      ({persona.id})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${meta.badge}`}
                  >
                    {persona.weight}%
                  </span>
                  {personas.length > 1 && (
                    <button
                      type="button"
                      title={`Remove ${meta.label}`}
                      onClick={() => handleRemovePersona(persona.id)}
                      className="rounded p-1 text-xs text-[#8B93A1] transition hover:bg-rose-500/20 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-[10px] text-[#8B93A1]">0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={persona.weight}
                  onChange={(e) => handleSliderChange(index, e.target.value)}
                  className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#2A3441] ${meta.accent}`}
                />
                <span className="text-[10px] text-[#8B93A1]">100%</span>
              </div>
            </div>
          );
        })}
      </div>

      {availableToAdd.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#2A3441] pt-4">
          <select
            value={selectedToAdd}
            onChange={(e) => setSelectedToAdd(e.target.value)}
            className="rounded-lg border border-[#2A3441] bg-[#0B0F14] px-3 py-2 text-xs text-[#E8ECF1] focus:border-purple-500 focus:outline-none"
          >
            <option value="">+ Select persona to add...</option>
            {availableToAdd.map((id) => (
              <option key={id} value={id}>
                {PERSONA_META[id]?.icon} {PERSONA_META[id]?.label || id}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedToAdd}
            onClick={handleAddPersona}
            className="rounded-lg border border-purple-500/40 bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-200 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Persona
          </button>
        </div>
      )}
    </section>
  );
}
