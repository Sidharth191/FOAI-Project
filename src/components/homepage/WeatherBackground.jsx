import React from "react";

export default function WeatherBackground({ condition }) {
  if (!condition || condition === "unknown") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Clear Condition */}
      {condition === "clear" && (
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F0A93F]/15 blur-3xl" />
      )}

      {/* Cloud Conditions */}
      {(condition === "partly_cloudy" || condition === "cloudy") && (
        <div className="animate-cloud-drift absolute inset-0">
          <div className="absolute top-10 -left-10 h-64 w-96 rounded-full bg-[#2A3441]/30 blur-3xl" />
          <div className="absolute top-40 right-0 h-72 w-[30rem] rounded-full bg-[#151B24]/40 blur-3xl" />
          {condition === "cloudy" && (
            <div className="absolute top-24 left-1/3 h-80 w-80 rounded-full bg-[#2A3441]/25 blur-3xl" />
          )}
        </div>
      )}

      {/* Fog Condition */}
      {condition === "fog" && (
        <div className="absolute inset-x-0 top-1/4 h-64 bg-gradient-to-r from-transparent via-[#2A3441]/35 to-transparent blur-2xl" />
      )}

      {/* Rain / Drizzle / Heavy Rain / Thunderstorm Conditions */}
      {(condition === "drizzle" ||
        condition === "rain" ||
        condition === "heavy_rain" ||
        condition === "thunderstorm") && (
        <div className="absolute inset-0 opacity-30">
          {condition === "thunderstorm" && (
            <div className="animate-lightning absolute inset-0 bg-[#E8ECF1]/10" />
          )}
          {Array.from({
            length:
              condition === "drizzle"
                ? 10
                : condition === "rain"
                ? 18
                : 28,
          }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-[1.5px] rounded-full bg-[#3EA8B8] ${
                condition === "drizzle"
                  ? "h-8 animate-rain-slow"
                  : condition === "rain"
                  ? "h-12 animate-rain-med"
                  : "h-16 animate-rain-fast"
              }`}
              style={{
                left: `${(i * 100) / (condition === "drizzle" ? 10 : condition === "rain" ? 18 : 28)}%`,
                animationDelay: `${(i * 0.2).toFixed(1)}s`,
                top: `-${Math.random() * 20}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow Condition */}
      {condition === "snow" && (
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="animate-snow-slow absolute h-2 w-2 rounded-full bg-[#E8ECF1]"
              style={{
                left: `${(i * 100) / 16}%`,
                animationDelay: `${(i * 0.4).toFixed(1)}s`,
                top: "-10px",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
