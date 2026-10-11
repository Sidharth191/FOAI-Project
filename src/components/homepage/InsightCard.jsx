import React, { useState } from "react";

// P4-owned. Renders one Insights.card. Order/priority already applied by P2 —
// this component just renders whatever order it's given, does not re-sort.

export default function InsightCard({ card }) {
  const [tiltStyle, setTiltStyle] = useState({});

  if (!card) return null;

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
      className="flex flex-col gap-2 rounded-xl border border-[#2A3441] bg-[#151B24] p-4 shadow-[0_8px_20px_rgb(0,0,0,0.3)] backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        {card.icon && (
          <span className="text-xl leading-none" aria-hidden="true">
            {card.icon}
          </span>
        )}
        <span className="font-semibold text-[#E8ECF1]">{card.title}</span>
      </div>
      <p className="text-sm text-[#8B93A1]">{card.body}</p>
    </div>
  );
}

/**
 * Renders Insights.cards in the given order (no re-sort; cards[].priority
 * is already applied by P2).
 */
export function InsightCardList({ cards }) {
  if (!Array.isArray(cards) || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <InsightCard key={card.id} card={card} />
      ))}
    </div>
  );
}