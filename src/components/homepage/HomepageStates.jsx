import AlertList from "./AlertList.jsx";
import { InsightCardList } from "./InsightCard.jsx";
import Spotlight from "./Spotlight.jsx";
import StatGrid from "./StatGrid.jsx";
import ForecastStrip from "./ForecastStrip.jsx";
import WeatherBackground from "./WeatherBackground.jsx";

function formatNumeric(value) {
  if (value === null || Number.isNaN(value)) return "—";
  return String(value);
}

function formatClock(value) {
  if (value === null) return "—";
  return value;
}

function formatFlag(value) {
  if (value === null) return "—";
  return String(value);
}

const NUMERIC_KEYS = [
  "tempC",
  "feelsLikeC",
  "humidityPct",
  "windKph",
  "windDirDeg",
  "uv",
  "aqi",
  "pm25",
  "rainProbPct",
  "precipMm",
  "visibilityKm",
  "soilMoisturePct",
  "waveM",
  "waterTempC",
];

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-2/3 rounded bg-neutral-200" />
      <div className="h-4 w-1/3 rounded bg-neutral-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded bg-neutral-200" />
        <div className="h-20 rounded bg-neutral-200" />
        <div className="h-20 rounded bg-neutral-200" />
        <div className="h-20 rounded bg-neutral-200" />
      </div>
      <div className="h-24 rounded bg-neutral-200" />
    </div>
  );
}

function StaleBanner() {
  return (
    <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-sm text-amber-200 shadow-sm">
      Showing last known data
    </p>
  );
}

function OfflineChip() {
  return (
    <span className="inline-block rounded-full border border-[#2A3441] bg-[#151B24] px-2.5 py-0.5 text-xs text-[#8B93A1]">
      offline mode
    </span>
  );
}

function AllClear() {
  return (
    <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-4 text-sm text-emerald-900">
      All clear
    </p>
  );
}

function FullError({ message, onRetry }) {
  return (
    <div className="space-y-3" role="alert">
      <p>{message}</p>
      <button type="button" className="border px-4 py-2" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export default function HomepageStates({
  profile,
  reading,
  insights,
  status,
  onRefresh,
  onOpenSettings,
}) {
  if (status === "loading" && reading === null) {
    return (
      <div className="space-y-4 p-6 text-left">
        <Header onRefresh={onRefresh} onOpenSettings={onOpenSettings} />
        <Skeleton />
      </div>
    );
  }

  const staleBanner = reading?.stale === true ? <StaleBanner /> : null;
  const hardError = reading != null && reading.error !== null && reading.tempC === null;

  if (hardError) {
    return (
      <div className="space-y-4 p-6 text-left">
        <Header onRefresh={onRefresh} onOpenSettings={onOpenSettings} />
        {staleBanner}
        <FullError message={reading.error.message} onRetry={onRefresh} />
      </div>
    );
  }

  if (reading == null) {
    return (
      <div className="space-y-4 p-6 text-left">
        <Header onRefresh={onRefresh} onOpenSettings={onOpenSettings} />
        <Skeleton />
      </div>
    );
  }

  const alerts = insights?.alerts ?? [];
  const locationName = profile?.locations?.[0]?.name ?? null;

  return (
    <div className="relative min-h-screen bg-[#0B0F14] p-6 text-left text-[#E8ECF1]">
      <WeatherBackground condition={reading.condition} />
      <div className="relative z-10 space-y-4">
        <Header onRefresh={onRefresh} onOpenSettings={onOpenSettings} />
        {staleBanner}
        <div className="flex flex-wrap items-center gap-2">
          {locationName !== null ? <p className="text-sm font-medium text-[#E8ECF1]">{locationName}</p> : null}
          {insights?.source === "rules" ? <OfflineChip /> : null}
        </div>
        <Spotlight headline={insights?.headline} alerts={alerts} />
        <p className="text-xs font-medium uppercase tracking-wider text-[#8B93A1]">
          condition: <span className="capitalize text-[#E8ECF1]">{reading.condition}</span>
        </p>
        <StatGrid reading={reading} />
        <AlertList alerts={alerts} />
        <InsightCardList cards={insights?.cards ?? []} />
        <ForecastStrip forecast={reading.forecast ?? []} />
      </div>
    </div>
  );
}

function Header({ onRefresh, onOpenSettings }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="rounded-lg border border-[#2A3441] bg-[#151B24] px-4 py-2 text-sm font-medium text-[#E8ECF1] shadow-sm transition-colors hover:bg-[#2A3441]"
        onClick={onRefresh}
      >
        Refresh
      </button>
      <button
        type="button"
        className="rounded-lg border border-[#2A3441] bg-[#151B24] px-4 py-2 text-sm font-medium text-[#E8ECF1] shadow-sm transition-colors hover:bg-[#2A3441]"
        onClick={onOpenSettings}
      >
        Settings
      </button>
    </div>
  );
}
