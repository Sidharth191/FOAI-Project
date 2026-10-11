import React from "react";

// P4-owned. Renders Insights.alerts exactly as given — already sorted
// critical > warning > info by P2. Do NOT re-sort here.

const SEVERITY_STYLES = {
  critical: "border-l-4 border-l-red-500 border-y-[#2A3441] border-r-[#2A3441] bg-red-500/10 text-red-100",
  warning: "border-l-4 border-l-[#F0A93F] border-y-[#2A3441] border-r-[#2A3441] bg-[#F0A93F]/10 text-[#E8ECF1]",
  info: "border-l-4 border-l-[#3EA8B8] border-y-[#2A3441] border-r-[#2A3441] bg-[#3EA8B8]/10 text-[#E8ECF1]",
};

const FALLBACK_STYLE = "border-l-4 border-l-[#2A3441] border-y-[#2A3441] border-r-[#2A3441] bg-[#151B24] text-[#E8ECF1]";

export default function AlertList({ alerts }) {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-sm font-medium text-emerald-300 shadow-sm">
        All clear
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className={`flex items-start gap-3 rounded-xl border p-4 shadow-[0_4px_15px_rgb(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgb(0,0,0,0.5)] ${
            SEVERITY_STYLES[alert.severity] ?? FALLBACK_STYLE
          }`}
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {alert.icon}
          </span>
          <div className="flex flex-col gap-1 text-left">
            <span className="font-semibold text-[#E8ECF1]">{alert.title}</span>
            <span className="text-sm text-[#8B93A1]">{alert.message}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}