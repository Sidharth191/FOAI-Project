import React, { useState } from "react";

function formatNumeric(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return String(value);
}

function ForecastCard({ day }) {
  const [tiltStyle, setTiltStyle] = useState({});

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

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="flex min-w-[150px] flex-1 flex-col justify-between rounded-xl border border-[#2A3441] bg-[#151B24] p-4 shadow-[0_8px_20px_rgb(0,0,0,0.3)] backdrop-blur-md"
    >
      <div>
        <p className="text-xs font-semibold text-[#E8ECF1]">{day.date}</p>
        <p className="text-xs capitalize text-[#8B93A1]">{day.condition}</p>
      </div>

      <div className="mt-4 space-y-1.5 text-xs">
        <div className="flex justify-between text-[#8B93A1]">
          <span>High / Low</span>
          <span className="font-mono font-semibold text-[#E8ECF1]">
            {formatNumeric(day.tempMaxC)}° / {formatNumeric(day.tempMinC)}°
          </span>
        </div>
        <div className="flex justify-between text-[#8B93A1]">
          <span>Rain</span>
          <span className="font-mono text-[#3EA8B8]">{formatNumeric(day.rainProbPct)}%</span>
        </div>
        <div className="flex justify-between text-[#8B93A1]">
          <span>UV Max</span>
          <span className="font-mono text-[#F0A93F]">{formatNumeric(day.uvMax)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ForecastStrip({ forecast = [] }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">Forecast</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {forecast.map((day) => (
          <ForecastCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
