# KAIROS — AI Agent Rules (all tools)

> Every teammate loads this file into their AI coding tool before writing a line.
> Antigravity: keep it at repo root as `AGENT.md` **and** copy to `.agent/rules/kairos.md`.
> Cursor: copy to `.cursor/rules/kairos.mdc`.
> Claude Code / Copilot / Codex: `AGENTS.md` at root is read automatically.

---

## What this project is

KAIROS is a weather app that shows a **different homepage for a different person**
under the **same weather**. Six people build six modules in parallel and integrate
them progressively. The whole thing only works if the data passed between modules
never drifts.

## The rule that overrides everything

**Never invent, rename, re-case, or "improve" a field name.**
If the data you need is not in `src/contracts/`, you do not silently add it —
you stop and tell Person 4.

Wrong, and it will cost the team an hour at 3am:
`feels_like`, `feelslike`, `apparentTemp`, `temperature`, `temp_c`, `airQuality`
Right: `feelsLikeC`, `tempC`, `aqi` — exactly as spelled in `src/contracts/reading.js`.

## Non-negotiables for any code you generate

1. **Read `src/contracts/index.js` before writing code.** It lists every frozen
   function signature. Match them exactly — same name, same argument order, same
   return shape.
2. **Everything crossing a module boundary is `async`** and returns a Promise.
   No exceptions, including `getSurveyAnswers()`.
3. **camelCase for every key.** No snake_case, no PascalCase keys, ever.
4. **Missing data is `null`.** Never `0`, never `undefined`, never `""`, never
   `"N/A"`, never a missing key. Arrays default to `[]`, not `null`.
5. **Units live in the key name and never change.** `tempC` Celsius, `windKph`
   km/h, `visibilityKm` km, `precipMm` mm, `*Pct` 0–100 integers.
6. **All timestamps are ISO-8601 UTC strings** (`new Date().toISOString()`).
   Clock times shown to users are local 24h `"HH:MM"`. Not `"5:58 AM"`.
7. **Every ID string comes from `src/contracts/enums.js`.** Never type a persona,
   condition, severity or error code as a raw literal.
8. **Services never throw for expected failures.** They resolve to a valid,
   full-shaped object with `error` set and `stale: true`. The UI must survive a
   dead API, a dead AI, and no internet, because the demo will be on venue wifi.
9. **Never mutate an object you were given.** Return a new one.
10. **UI never calls an API directly.** Homepage reads `reading.tempC`. It must
    not know Open-Meteo or Gemini exist. Same for the AI provider.
11. **Only edit files inside the folder you own** (see ownership table below).
    If your task seems to need a change in someone else's file, stop and say so
    instead of editing it.
12. **Validate before returning.** Call the matching `validate*()` helper from
    `src/contracts/` in dev and log the errors. It catches drift the same day
    instead of on integration night.

## Ownership — do not edit outside your column

| Person | Owns (editable) | Read-only for them |
|---|---|---|
| P1 | `screens/Welcome`, `screens/Survey`, `services/survey` | everything else |
| P2 | `services/ai`, `screens/Processing` | everything else |
| P3 | `services/weather` | everything else |
| P4 | `App.jsx`, `screens/Homepage`, `components/`, `contracts/`, `data/` | — |
| P5 | `services/cache`, `tests/` | everything else |
| P6 | `docs/pitch/` | all code |
| P7 | `screens/Settings`, `services/profile`, `screens/ProfileConfirmation` | everything else |

`src/contracts/`, `src/data/mockData.js`, `src/App.jsx`, `package.json`,
`vite.config.js` and `tailwind.config.js` are **P4-only**. Never edit them.

## Build your module against mocks, not against people

Import from `src/data/mockData.js` and build the full path today. Swap the mock
for the real service later — the shape is identical, so nothing else changes.

```js
import { mockProfile, mockReading, mockInsights } from "../data/mockData";
```

Test against **both** scenarios: `mockProfile`/`mockReading` (Jaipur, farmer +
parent, extreme) and `mockProfileB`/`mockReadingB` (Chennai, fitness + health,
calm). If your module handles both, it will handle integration.

## Secrets

API keys go in `.env` as `VITE_*` and are read via `import.meta.env`. Never
hardcode a key in a source file, never commit `.env`, never paste a key into
your AI tool's chat. Add new keys to `.env.example` with an empty value and tell
P4.

## Stack — fixed, do not swap

React 18 + Vite + JavaScript (not TypeScript) + Tailwind. No router library
unless P4 adds it. Do not add a state management library. Do not add a UI kit.
Before running `npm install <anything>`, ask P4 — a new dependency in one
person's branch breaks everyone else's `npm ci`.
