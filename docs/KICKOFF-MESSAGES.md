# KAIROS — messages to send (copy-paste)

Send the group message first, then the six individual ones.

---

## To the group

> **KAIROS — read before you code (5 min)**
>
> The repo is up with the architecture already in place. Please do these four
> things before writing any real logic:
>
> 1. `git clone` → `npm ci` → `npm run dev`. It should already run.
> 2. Open `src/contracts/index.js`. That file lists every function each of us
>    owns and the exact shape it returns. Read yours.
> 3. Load `AGENTS.md` into your AI tool as a project rule.
>    Cursor: `.cursor/rules/kairos.mdc` is already there, just confirm it loads.
>    Antigravity: `AGENT.md` at root + `.agent/rules/kairos.md`.
>    Then start every session by pinning `@src/contracts/index.js`.
> 4. Your module already exists as a **stub** in `src/services/<yours>/`. It
>    returns mock data with the correct signature. Your job is to replace the
>    body between the `---- STUB BODY ----` markers. **Do not change the function
>    name, the arguments, or the shape of what comes back.**
>
> **The one rule:** never rename, re-case, or invent a field name. If you need
> data that isn't in the contracts, message me — don't add it quietly. A renamed
> field doesn't throw an error, it just makes a card render blank, and we won't
> notice until the demo.
>
> `src/contracts/`, `src/data/mockData.js`, `src/state/`, `src/App.jsx` and
> `package.json` are mine. Don't edit them, and don't `npm install` anything
> without asking — a new dependency on one branch breaks everyone's build.
>
> **First commit due today:** your stub, on your branch, still returning mock
> data, with a `console.log` proving it runs. That's it. It proves the chain
> holds before any of us has anything to lose.
>
> Test scenarios are in `src/data/mockData.js`. Scenario A is farmer+parent in
> Jaipur with brutal weather. Scenario B is fitness+health in Chennai, calm.
> If your module handles both, integration will work.

---

## P1 — Survey

> Branch `feature/survey`. You own `screens/Welcome`, `screens/Survey`,
> `services/survey`.
>
> Replace the stub body in `src/services/survey/index.js`. The survey UI is
> completely yours — steps, chips, sliders, however you want it. The only thing
> the rest of us depend on is the object you hand back matching
> `src/contracts/survey.js`.
>
> Two things that will bite you: `interests` must contain values from
> `PERSONA_IDS` (your button can say "I farm", the stored value must be
> `"farmer"`), and lat/long must be **numbers**, not strings — geolocation and
> input fields both hand you strings.
>
> Done when: finishing the survey logs an object that passes
> `validateSurveyAnswers()` with zero errors. Show me that console line.

## P2 — AI engine

> Branch `feature/ai`. You own `services/ai`, `screens/Processing`.
>
> You have **two** functions, not one. `generateProfile` runs once after the
> survey. `generateInsights(profile, reading)` runs on every refresh and every
> location change — read `src/contracts/insights.js` carefully, that's the one
> that drives the whole homepage.
>
> Build the **rules-based path first**: compare `reading` against
> `profile.thresholds` and emit alerts. Get that working end to end. Then add the
> AI call on top with the rules path as fallback. If the AI key rate-limits
> during the demo — and it might — the app has to keep working.
>
> Prompt the model for JSON only, strip markdown fences defensively, wrap in
> try/catch. Never throw out of either function.
>
> Done when: both functions pass their validators against scenario A and B,
> **with the network off**.

## P3 — Weather

> Branch `feature/weather`. You own `services/weather`.
>
> Replace the stub in `src/services/weather/index.js`. Start your return object
> from `{ ...EMPTY_READING }` and overwrite fields — that way you can never
> accidentally omit one.
>
> Three things: air quality is a **separate Open-Meteo endpoint** from the
> forecast, so fetch both in parallel and let one fail without killing the other.
> Map the weather code onto the `CONDITIONS` enum, never pass the raw code
> through. And pollen and soil moisture genuinely aren't available in many
> regions — `null` is the correct answer, the UI handles it, please don't
> substitute a plausible number.
>
> Echo `location.id` back as `reading.locationId`. I use it to discard responses
> for a city the user already switched away from.
>
> Done when: `getReading()` passes `validateReading()` for both scenarios, and
> also passes with wifi switched off.

## P5 — QA + cache

> Branch `feature/qa-cache`. You own `services/cache`, `tests/`.
>
> The cache stub works in memory — swap it for localStorage with the same
> signatures.
>
> Your highest-value work isn't tests. It's a script that imports each person's
> real service, runs the matching `validate*()` function, and prints failures.
> Run it every time anything merges to `integration`. That script will catch more
> bugs than everything else you could do, because contract drift is silent.
>
> Second priority: run both scenarios end to end, and run the whole app with the
> network disabled.

## P6 — Pitch

> Branch `feature/pitch`, `docs/pitch/` only. No code.
>
> One technical ask: the demo has to show **the same weather producing two
> different homepages**. Get screenshots of scenario A and scenario B side by
> side as soon as I have the homepage rendering from mocks — don't wait for the
> real APIs, that's days away and the visual is the whole pitch.

## P7 — Settings + locations

> Branch `feature/settings`. You own `screens/Settings`, `services/profile`,
> `screens/ProfileConfirmation`.
>
> Both your functions return a **new** Profile object. Never mutate the one you
> were passed — React won't re-render and it will look like your feature is
> broken when it isn't. The stub shows the spread pattern.
>
> `switchLocation` moves the chosen location to `locations[0]` and stops there.
> It does **not** fetch weather. I watch for the profile change and refetch. If
> Settings starts calling the weather service directly we get two competing
> refresh paths and a race condition that only shows up when someone taps fast.
>
> Done when: changing location in Settings gives me a Profile whose
> `locations[0]` is the new city.
