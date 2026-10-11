import React, { useState } from "react";

function formatNumeric(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return String(value);
}

function formatClock(value) {
  if (value === null || value === undefined) return "—";
  return value;
}

function formatFlag(value) {
  if (value === null || value === undefined) return "—";
  return String(value);
}

function getProportion(label, numericVal) {
  if (numericVal === null || numericVal === undefined || Number.isNaN(numericVal)) return 0;
  const num = Number(numericVal);
  if (label.includes("Temp") || label.includes("Feels")) {
    return Math.min(Math.max(num / 50, 0), 1);
  }
  if (label.includes("AQI")) {
    return Math.min(Math.max(num / 300, 0), 1);
  }
  if (label.includes("UV")) {
    return Math.min(Math.max(num / 12, 0), 1);
  }
  return 0.5;
}

export function StatChip({ label, value, rawValue, unit = "", variant = "standard" }) {
  const [tiltStyle, setTiltStyle] = useState({});
  const displayVal = typeof value === "boolean" ? formatFlag(value) : value;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 4;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 100ms ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 400ms ease-out",
    });
  };

  if (variant === "hero") {
    const proportion = getProportion(label, rawValue);
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - proportion);
    const ringColor = label.includes("AQI") || label.includes("Feels") ? "#3EA8B8" : "#F0A93F";

    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="flex flex-col justify-between rounded-xl border border-[#2A3441] bg-[#151B24] p-4 shadow-[0_8px_20px_rgb(0,0,0,0.3)] backdrop-blur-md"
      >
        <span className="text-xs font-medium uppercase tracking-wider text-[#8B93A1]">{label}</span>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-[#E8ECF1]">{displayVal}</span>
            {unit && displayVal !== "—" ? <span className="text-xs text-[#8B93A1]">{unit}</span> : null}
          </div>
          {/* Circular SVG Gauge Ring */}
          <div className="relative h-10 w-10 flex-shrink-0">
            <svg className="h-10 w-10 -rotate-90 transform" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-[#2A3441]"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke={ringColor}
                strokeWidth="3.5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="flex items-center justify-between rounded-lg border border-[#2A3441] bg-[#151B24]/80 px-3 py-2.5 text-xs shadow-sm"
    >
      <span className="font-medium text-[#8B93A1]">{label}</span>
      <span className="font-mono font-semibold text-[#E8ECF1]">
        {displayVal}
        {unit && displayVal !== "—" ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

export default function StatGrid({ reading }) {
  if (!reading) return null;

  return (
    <div className="space-y-4">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip
          label="Temperature"
          value={formatNumeric(reading.tempC)}
          rawValue={reading.tempC}
          unit="°C"
          variant="hero"
        />
        <StatChip
          label="Feels Like"
          value={formatNumeric(reading.feelsLikeC)}
          rawValue={reading.feelsLikeC}
          unit="°C"
          variant="hero"
        />
        <StatChip
          label="AQI"
          value={formatNumeric(reading.aqi)}
          rawValue={reading.aqi}
          variant="hero"
        />
        <StatChip
          label="UV Index"
          value={formatNumeric(reading.uv)}
          rawValue={reading.uv}
          variant="hero"
        />
      </div>

      {/* Standard Stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        <StatChip label="Humidity" value={formatNumeric(reading.humidityPct)} unit="%" />
        <StatChip label="Wind Speed" value={formatNumeric(reading.windKph)} unit="km/h" />
        <StatChip label="Wind Dir" value={formatNumeric(reading.windDirDeg)} unit="°" />
        <StatChip label="PM2.5" value={formatNumeric(reading.pm25)} unit="µg/m³" />
        <StatChip label="Rain Prob" value={formatNumeric(reading.rainProbPct)} unit="%" />
        <StatChip label="Precipitation" value={formatNumeric(reading.precipMm)} unit="mm" />
        <StatChip label="Visibility" value={formatNumeric(reading.visibilityKm)} unit="km" />
        {reading.soilMoisturePct !== null && reading.soilMoisturePct !== undefined ? (
          <StatChip label="Soil Moisture" value={formatNumeric(reading.soilMoisturePct)} unit="%" />
        ) : null}
        {reading.waveM !== null && reading.waveM !== undefined ? (
          <StatChip label="Waves" value={formatNumeric(reading.waveM)} unit="m" />
        ) : null}
        {reading.waterTempC !== null && reading.waterTempC !== undefined ? (
          <StatChip label="Water Temp" value={formatNumeric(reading.waterTempC)} unit="°C" />
        ) : null}
        <StatChip label="Sunrise" value={formatClock(reading.sunrise)} />
        <StatChip label="Sunset" value={formatClock(reading.sunset)} />
        {reading.frost !== null && reading.frost !== undefined ? (
          <StatChip label="Frost" value={formatFlag(reading.frost)} />
        ) : null}
        {reading.fog !== null && reading.fog !== undefined ? (
          <StatChip label="Fog" value={formatFlag(reading.fog)} />
        ) : null}
      </div>
    </div>
  );
}
