# KAIROS — FROZEN LIST

Anything on this page changes **only** after Person 4 announces it in the team
chat and everyone pulls. Changing one of these quietly is the single most
common way a hackathon team ends up with six finished modules and zero working app.

---

## Tier 1 — Freeze hardest. Breaking these breaks the app silently.

Silent breakage is the dangerous kind: no error, just a blank card or a missing
alert that nobody notices until the demo.

| # | Frozen thing | Why a change kills you |
|---|---|---|
| 1 | **Every key name** in `surveyAnswers`, `Profile`, `Reading`, `Insights` | `reading.feelsLikeC` becomes `undefined`, the card renders empty, no error thrown |
| 2 | **Casing** — camelCase everywhere | `persona_details` vs `personaDetails` is a silent `undefined` |
| 3 | **Units baked into key names** — `tempC`, `windKph`, `visibilityKm`, `precipMm`, `*Pct` | someone returns Fahrenheit, the heat alert never fires |
| 4 | **Types** — number stays number, `"41"` is not `41` | `"41" > 38` is true by luck, `"9" > 20` is false by luck; string comparison will bite you |
| 5 | **`null` for missing, `[]` for empty arrays** | `0` reads as "soil moisture zero → emergency alert"; `undefined` crashes `.map()` |
| 6 | **Enum values** in `src/contracts/enums.js` | P1 sends `"Fitness"`, P2 matches `"fitness"`, persona silently drops |
| 7 | **`personas[]` sorted by weight DESC, weights sum to 100** | homepage ordering logic in P4 assumes it |
| 8 | **`locations[0]` is always the active location** | switching location appears to do nothing |
| 9 | **Threshold key names carry direction** — `tempMaxC` vs `soilMoistureMinPct` | comparison flips, alerts fire backwards |
| 10 | **`reading.locationId` echoes the requested location** | fast location switches show the wrong city's weather (race condition) |

## Tier 2 — Freeze hard. Breaking these throws, loudly.

| # | Frozen thing | Why |
|---|---|---|
| 11 | **Function names**: `getSurveyAnswers`, `generateProfile`, `generateInsights`, `getReading`, `updateProfile`, `switchLocation`, `cacheGet`, `cacheSet` | P4 imports them by name |
| 12 | **Argument order and shape**: `generateInsights(profile, reading)` never `(reading, profile)` | both are objects, so a swap fails deep inside, not at the call |
| 13 | **Everything is `async`** | one sync function and P4's `await` chain silently yields a Promise object into the UI |
| 14 | **Named exports, not default** | `import { getReading }` breaks on a default export |
| 15 | **File paths**: `services/weather/index.js` etc. | import paths across the app |
| 16 | **Services never throw** — they resolve with `error` set | one unhandled rejection blanks the whole homepage |
| 17 | **No mutation of inputs** | P7 mutating the profile makes React skip the re-render |

## Tier 3 — Freeze the environment.

| # | Frozen thing | Why |
|---|---|---|
| 18 | **Node version** (pin one, e.g. 20.x) | lockfile and build differences |
| 19 | **`package.json` + lockfile** — P4 installs everything | two people adding different versions = merge hell |
| 20 | **React 18 + Vite + JS + Tailwind** | one CRA branch cannot merge into a Vite repo |
| 21 | **No TypeScript in some files only** | mixed setup breaks the build for everyone |
| 22 | **Folder structure** | agreed import paths |
| 23 | **`.env` variable names** (`VITE_GEMINI_API_KEY` etc.) | P5/P4 reference them |
| 24 | **`src/App.jsx`, `src/contracts/`, `src/data/mockData.js`** — P4-only files | six people editing the integration point = constant conflicts |
| 25 | **Branch names + "no direct push to `main`"** | |
| 26 | **The two test scenarios** in `mockData.js` | everyone must be testing the same user |
| 27 | **Timestamp format** — ISO UTC in data, local `"HH:MM"` for display | timezone bugs are invisible until the judge asks about sunrise |
| 28 | **Language codes** `en`/`ta`/`hi` | i18n keys |

---

## What you CAN change freely, any time, without asking

- Anything **inside** your module that does not appear in a contract
- Your own component names, internal state, helper functions, file splits
- Your CSS and layout, animation, copywriting
- Which API endpoint or AI model you call internally, as long as the output shape holds
- **Adding** an optional key to a contract object is *usually* safe (nothing
  breaks if P4 ignores it) — but still tell P4, because P5's validator will flag it

## How to change a frozen thing when you genuinely must

1. Post in team chat: **what** key, **from → to**, and **why**.
2. P4 edits `src/contracts/` and `src/data/mockData.js`, bumps nothing else.
3. P4 pushes to `integration` and posts "contract changed, pull now".
4. Everyone pulls **before** their next commit.
5. Anyone who cannot pull immediately says so — don't let two shapes coexist.

Never do this in the last three hours. After the final integration checkpoint,
contracts are locked absolutely; work around a bad field name instead of fixing it.
