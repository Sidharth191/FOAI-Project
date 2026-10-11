# KAIROS — Voice (v2) planning notes

Read this **now**, build it **after checkpoint 4**.

## The core idea

Voice must not become a seventh module that reaches into everyone's code. If
voice needs to drive the survey, read the homepage, and control settings, it cuts
across all six people and you rewrite the app.

The way to avoid that: **voice is another consumer of the contracts you already
froze**, not a new path through the system.

```
                 ┌──────────────┐
   microphone ──▶│  voice/      │──▶ same functions everyone else calls
                 │  (P4 or P1)  │    switchLocation(), saveSurveyAnswers()
                 └──────────────┘
                        ▲
                    Insights ──▶ speech synthesis
```

Voice output is nearly free because of how `Insights` is already shaped:
`headline` is one short sentence, `alerts[].title` and `alerts[].message` are
short and already in `profile.language`, and the emoji lives in `alert.icon`
**separate from the text** — so a screen reader or TTS engine never has to read
"fire emoji". That separation was deliberate. Don't let anyone merge the emoji
into `title` as a "simplification".

## Two features, very different difficulty

| | Voice **output** (TTS) | Voice **input** (STT) |
|---|---|---|
| API | `window.speechSynthesis` | `webkitSpeechRecognition` or an audio model API |
| Works offline | yes | no (Chrome streams audio to Google) |
| Browser support | good everywhere | Chrome/Edge solid, Safari/Firefox unreliable |
| Indian language voices | device-dependent, Tamil/Hindi often present on Android | Tamil recognition is hit-and-miss |
| Build time | ~2 hours | ~1 day with fallbacks |
| Demo risk | low | high — venue noise, mic permissions, wifi |

**Do output first.** It's most of the impact for a tenth of the risk. A farmer
holding a phone and hearing "Soil moisture nine percent, below what you need for
sowing — irrigate first" is the demo moment. Speaking *to* the app is a smaller
win than being spoken *to*.

## Reserve these fields now, while it's cheap

Contract changes are the expensive thing. Adding a key today costs nothing;
adding one on integration night costs an hour. Ask P1 and P2 to include:

```js
// survey.js -> preferences
preferences: {
  language: "en",
  units: "metric",
  voiceOutput: false,   // RESERVED for v2, ignored in v1
  voiceInput: false,    // RESERVED for v2, ignored in v1
}
```

```js
// insights.js -> Alert (optional)
speech: null   // RESERVED: a TTS-friendly rewrite of `message` when the
               // written version has abbreviations. null = just read `message`.
```

That's it. Nothing else needs to change. `profile.language` already feeds
`utterance.lang` directly.

## Design rules for when you build it

1. **Voice commands call the same functions the buttons call.** "Switch to
   Delhi" must go through `switchLocation(profile, "delhi")` — P7's function,
   unchanged. Never a parallel code path, or you'll have two behaviours to debug.
2. **Intent parsing goes through P2's AI service**, as a third function
   `parseVoiceCommand(transcript, profile)` returning a small frozen shape like
   `{ intent: "switch_location" | "refresh" | "read_alerts" | "unknown", args: {} }`.
   Keep the vocabulary tiny — four intents, not twenty.
3. **Never let voice write directly to state.** It produces an intent; the
   existing handler does the work.
4. **Always show what it heard.** Print the transcript on screen before acting.
   Judges forgive a misrecognition they can see; they don't forgive an app that
   does something random.
5. **Barge-in**: stop speech on any tap. `speechSynthesis.cancel()` on every
   screen change, or you get overlapping audio the moment someone navigates.

## Demo-day cautions

- Request mic permission **before** you present, not on stage. A permission
  prompt mid-demo reads as a bug.
- Have a fallback button that plays the same flow from a typed transcript. If
  the room is loud, you switch to it without explaining.
- TTS voice availability varies per device. Test on the exact phone you'll demo
  on, and call `speechSynthesis.getVoices()` early — on Chrome it returns empty
  on first call until the `voiceschanged` event fires. That one costs everyone an
  hour.
- Keep spoken output under ~15 seconds. Headline plus the top two alerts.

## For P6's pitch

Voice plus the multilingual field you already have plus weather is a real
accessibility story: a farmer with limited literacy gets the same personalised
briefing as anyone else, in Tamil, spoken. That's a stronger framing than "we
added voice commands" — lead with who it's for, not what the feature is.

## Gate

Don't start voice until checkpoint 4 is green (settings → location change →
new reading → homepage updates). If v1 isn't integrated, voice is a distraction
that costs you the working demo.
