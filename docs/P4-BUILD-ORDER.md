# P4 — Build order & Cursor execution

## The order (do not reorder)

| # | Deliverable | Why here |
|---|---|---|
| 0 | Repo, contracts, mocks, `AGENTS.md`, branches | done |
| 1 | **Stub services for all 7 modules** | every teammate gets a running app before writing a line; signatures can't drift because they already exist |
| 2 | `state/useKairos.js` + `App.jsx` screen switch | one refresh path, race guard, single source of truth |
| 3 | Homepage **unhappy states first** | loading / stale / error / zero alerts / all-null |
| 4 | Homepage happy path from mocks | scenario A and scenario B must look visibly different |
| 5 | Swap stubs for real services as they land | one per checkpoint |
| 6 | Polish, animation, empty-state copy | last, and only last |

Step 1 is the one people skip. Mock *data* still lets someone write
`getWeather(lat, lng)` instead of `getReading(location)`. Mock *services* don't.

Step 3 is the other one people skip. Everyone builds the happy path. The demo
dies on the unhappy path — venue wifi, rate-limited AI key, a city with no soil
moisture data. Build a homepage that survives every field being `null` and you
will not be debugging at 4am.

---

## Cursor setup (once, 10 minutes)

1. `.cursor/rules/kairos.mdc` is already in the repo with `alwaysApply: true`. Confirm it loads: Settings → Rules should list it.
2. Add to `.cursorignore`:
   ```
   .env
   ```
3. Turn **on** "Include project rules in Agent". Turn **off** auto-run of terminal commands — you want to see `npm install` before it happens.
4. Pin context in every prompt with `@`:
   `@src/contracts/index.js @src/data/mockData.js`
   Cursor will otherwise reconstruct field names from memory and invent
   `apparentTemperature` because it reads better than `feelsLikeC`.

## The prompt pattern that works

Bad: *"build the homepage"* → 600 lines, invented fields, edits P7's files.

Good: one screen or one concern per prompt, contracts pinned, states enumerated,
plan before code.

### Prompt 1 — plan only

```
@src/contracts/index.js @src/state/useKairos.js @AGENTS.md

I'm Person 4. I need the Homepage screen. Do NOT write code yet.

Give me a plan: component tree, which props each component takes, and which
file each lives in under src/components/homepage/.

Constraints:
- Props are exactly: profile, reading, insights, status, onRefresh, onOpenSettings.
- No other imports. The homepage must not import anything from services/.
- Field names come only from the contracts I pinned. If you need a field that
  doesn't exist there, say so instead of inventing it.
```

Read the plan. Fix the field names it got wrong *now*, before any code exists.

### Prompt 2 — unhappy states

```
Implement src/components/homepage/HomepageStates.jsx handling, in this order:

1. status === "loading" and reading === null  -> skeleton
2. reading.stale === true                     -> "Showing last known data" banner, still render everything
3. reading.error !== null && reading.tempC === null -> full error state with retry
4. insights.source === "rules"                -> small "offline mode" chip
5. insights.alerts.length === 0               -> "All clear" state, not a blank space
6. every numeric field null                   -> em dash, never "0", never "NaN"

Tailwind only. No new dependencies.
```

### Prompt 3 — happy path

```
Now src/components/homepage/AlertList.jsx and InsightCard.jsx.

alerts: sorted critical > warning > info, already sorted by P2 — do not re-sort,
just render. severity drives colour. alert.icon is the emoji; do not add emoji
to title or message.

cards: render in the given order, cards[].priority is already applied.
```

### Prompt 4 — verify

```
Read every field access in src/components/homepage/ and list any that are not
present in @src/contracts/reading.js or @src/contracts/insights.js.
```

Run this one after every session. It catches drift in 20 seconds.

## Cursor habits that matter here

- **Review every diff before accepting.** Agent mode will happily edit
  `services/weather/index.js` to make your homepage work. That is P3's file and
  the change vanishes on their next push.
- **Never let it run `npm install`.** A dependency added on your branch breaks
  everyone else's `npm ci`.
- **New chat per concern.** A long thread drifts back to invented field names.
- **When it hallucinates a field, don't correct it inline** — re-pin the contract
  file. Correcting inline fixes one line; re-pinning fixes the session.

## Your definition of done for step 1–4

Open `?demo=1`, see a populated homepage with mock scenario A. Change one line to
scenario B and the homepage looks meaningfully different. Kill the network and it
still renders. That is the entire KAIROS pitch, working, before anyone else has
finished anything.
