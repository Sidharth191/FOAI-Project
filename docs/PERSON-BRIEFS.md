# KAIROS — Per-person briefs

Each person copies **AGENTS.md + their own block below** into their AI tool as a
project rule, then starts their first prompt with "Read `src/contracts/index.js`
and `src/data/mockData.js` first."

Where the rule file goes:

| Tool | Path |
|---|---|
| Antigravity | `AGENT.md` at repo root, plus `.agent/rules/kairos.md` (`trigger: always_on`) |
| Cursor | `.cursor/rules/kairos.mdc` (`alwaysApply: true`) |
| Claude Code, Copilot, Codex | `AGENTS.md` at repo root |
| Windsurf | `.windsurfrules` |
| Anything else | paste into the chat once per session |

---

## P1 — Survey

You own `screens/Welcome`, `screens/Survey`, `services/survey`.

Build: `async getSurveyAnswers(): Promise<SurveyAnswers>`, exported from
`src/services/survey/index.js`.

The survey UI is entirely yours — steps, chips, sliders, whatever you like.
The **only** thing that matters to the rest of the team is that the object you
hand back matches `src/contracts/survey.js` exactly.

- `interests` must be values from `PERSONA_IDS`. Your buttons can say
  "I farm" but the value stored must be `"farmer"`.
- `activities` from `ACTIVITY_IDS`, `[]` if the user picks none.
- Location: get lat/long as numbers. If geolocation is denied, fall back to a
  city picker. `latitude`/`longitude` must never be strings.
- Only include a `personaDetails.<persona>` key if the user actually selected
  that persona and answered its follow-ups. Never send `{}`.
- Before returning, run `validateSurveyAnswers()` and `console.warn` any errors.

Done when: completing the survey logs an object that passes validation with zero errors.

---

## P2 — AI engine

You own `services/ai`, `screens/Processing`.

Build two functions in `src/services/ai/index.js`:
- `async generateProfile(surveyAnswers): Promise<Profile>`
- `async generateInsights(profile, reading): Promise<Insights>`

Read `src/contracts/insights.js` carefully — `generateInsights` runs on **every**
refresh and location switch, not once.

- Weights in `personas` must be integers summing to 100, sorted descending.
- Every key in `EMPTY_THRESHOLDS` must be present; use `null` when it doesn't
  apply to this user.
- Prompt the model to return **JSON only**, no markdown fences. Strip
  ` ```json ` fences defensively before `JSON.parse`, and wrap in try/catch.
- **Mandatory fallback**: if the AI call fails, times out, or returns unparseable
  JSON, return a rules-based result (compare `reading` against
  `profile.thresholds`) with `source: "rules"` and `error` set. Never throw.
  Build the rules path **first**, the AI path second — the demo must survive
  no internet.
- Sort `alerts` critical → warning → info, and `cards` by `priority` descending.

Done when: `generateProfile(mockSurveyAnswers)` and
`generateInsights(mockProfile, mockReading)` both pass their validators, and
still work with the network turned off.

---

## P3 — Weather

You own `services/weather`.

Build `async getReading(location): Promise<Reading>` in
`src/services/weather/index.js`, where `location = { id, latitude, longitude }`.

- Return **every** key from `EMPTY_READING`, always. Start from
  `{ ...EMPTY_READING }` and overwrite — that way you can never miss one.
- Echo `location.id` back as `reading.locationId`. P4 needs it to discard
  responses for a city the user already switched away from.
- Map the API's weather code onto the `CONDITIONS` enum. Anything unmappable
  becomes `"unknown"`, not the raw code.
- Air quality is a **separate Open-Meteo endpoint** from the forecast. Fetch
  both, in parallel. If one fails, still return the other's data with `null`
  in the missing fields.
- Pollen and soil moisture aren't available everywhere — `null` is a perfectly
  correct answer, and the UI already handles it. Don't fake a number.
- Convert times to local `"HH:MM"` 24h. Convert everything to metric.
- `forecast` is 3–7 days, `[]` if unavailable, never `null`.
- On failure return `failedReading(location.id, code, message)`. Never throw,
  never reject.

Done when: `getReading(mockLocation)` and `getReading(mockLocationB)` both pass
`validateReading()`, and so does the response with wifi switched off.

---

## P4 — Integration + homepage (you)

You own `App.jsx`, `screens/Homepage`, `components/`, `contracts/`, `data/`.

You are the only person who edits contracts and mock data. Your homepage
consumes `profile`, `reading` and `insights` — and nothing else. It must never
import from `services/ai` or `services/weather` internals, only their index files.

Build the homepage against mocks on day one, wire real services in at each
checkpoint. Handle these states explicitly from the start, because they will all
happen live: loading, `reading.stale === true`, `reading.error !== null`,
`insights.source === "rules"`, `alerts.length === 0`, and every value `null`.

---

## P5 — QA + cache

You own `services/cache`, `tests/`.

- `async cacheGet(key)` → value or `null`. `async cacheSet(key, value, ttlSeconds)`.
- Cache key format: `reading:<locationId>` and `insights:<locationId>:<personaHash>`.
- Your highest-value work isn't tests, it's a **contract validator script** that
  runs all four `validate*()` functions against live output from each module and
  prints failures. Run it every time someone merges to `integration`.
- Second highest: verify both scenarios end-to-end, and verify the app with the
  network disabled.

---

## P6 — Pitch

You own `docs/pitch/`. You touch no code.

Your one technical ask: the demo must show **the same weather producing two
different homepages**. Get screenshots of scenario A and scenario B side by side
as soon as P4 has the homepage rendering from mocks — don't wait for the real
APIs.

---

## P7 — Settings + locations

You own `screens/Settings`, `services/profile`, `screens/ProfileConfirmation`.

Build in `src/services/profile/index.js`:
- `async updateProfile(profile, changes): Promise<Profile>`
- `async switchLocation(profile, locationId): Promise<Profile>`

Both return a **new** Profile object — `{ ...profile, locations: [...] }`. Never
mutate the input, or React will not re-render and it will look like your feature
is broken when it isn't.

`switchLocation` moves the chosen location to `locations[0]`; it does **not**
fetch weather. P4 sees the profile change and calls `getReading` again. Keep that
boundary — if Settings starts calling the weather service directly you get two
competing refresh paths and a race condition.

Done when: changing location in Settings produces a new Profile whose
`locations[0]` is the new city, and P4's homepage updates from it.
