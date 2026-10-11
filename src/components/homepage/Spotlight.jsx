import React, { useState } from "react";

export default function Spotlight({ headline, alerts = [] }) {
  const [tiltStyle, setTiltStyle] = useState({});

  if (!headline) return null;

  const topAlert = Array.isArray(alerts) && alerts.length > 0 ? alerts[0] : null;
  const alertStr = topAlert
    ? `${topAlert.id ?? ""} ${topAlert.personaId ?? ""} ${topAlert.metric ?? ""} ${topAlert.title ?? ""}`.toLowerCase()
    : "";

  const isHeatOrUv =
    alertStr.includes("uv") ||
    alertStr.includes("heat") ||
    alertStr.includes("sun") ||
    alertStr.includes("temp") ||
    alertStr.includes("farmer") ||
    alertStr.includes("outdoor");

  const isRainOrWater =
    alertStr.includes("rain") ||
    alertStr.includes("precip") ||
    alertStr.includes("water") ||
    alertStr.includes("commuter") ||
    alertStr.includes("flood");

  let gradientClasses = "from-[#151B24] via-[#151B24] to-[#2A3441]/50 border-[#2A3441]";
  let accentColorClass = "text-[#8B93A1]";

  if (isHeatOrUv) {
    gradientClasses = "from-[#151B24] via-[#151B24] to-[#F0A93F]/20 border-[#F0A93F]/40 shadow-[#F0A93F]/5";
    accentColorClass = "text-[#F0A93F]";
  } else if (isRainOrWater) {
    gradientClasses = "from-[#151B24] via-[#151B24] to-[#3EA8B8]/20 border-[#3EA8B8]/40 shadow-[#3EA8B8]/5";
    accentColorClass = "text-[#3EA8B8]";
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -3;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 3;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`,
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
      className={`rounded-xl border bg-gradient-to-br p-5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md ${gradientClasses}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${accentColorClass}`}>
        Persona Spotlight
      </p>
      <h2 className="mt-1.5 text-lg font-medium text-[#E8ECF1] sm:text-xl">{headline}</h2>
    </div>
  );
}
