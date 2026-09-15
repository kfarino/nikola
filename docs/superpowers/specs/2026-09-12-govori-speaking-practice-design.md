# Govori — speaking-first practice

> **Parked 2026-09-14** — revisit once daily use is steady. Work so far is on the unmerged `govori-speaking-practice` branch; Wiktionary glossed only 18% of words, see that branch's history.

**Date:** 2026-09-12
**Status:** design, awaiting review

## Why

Priče today shows the Croatian, plays it, and pauses. That is shadowing: the
text is on screen, so the parent reads and repeats. Nothing in the app ever
asks for Croatian to be produced from memory.

Pimsleur's engine is the opposite. It prompts in English, makes the learner
generate the answer into silence, and only then plays the confirmation.
Retrieval, not recognition. Kevin has used Pimsleur and felt real gains from
it, and asked that this match it as closely as possible.

Two further instructions shape everything below:

- **Speaking matters far more than reading or writing.**
- **Better to really learn some vocabulary than to kind of learn a lot.**

## Principles

1. **Production before confirmation.** Every prompt is answered aloud, from
   memory, before the app reveals anything.
2. **Eyes-free.** The practice loop is audio end to end. Nothing in it needs
   to be looked at — the phone can be propped across the room with a baby in
   your arms.
3. **Self-rated.** The app never listens. Pimsleur does not either. Honest
   self-assessment drives the schedule; no microphone, no permission prompt,
   no network, no speech-recognition verdict to be wrong about a learner's
   accent.
4. **Narrow and deep.** New material is admitted only when existing material
   is under control.

## The two-audience split

The app serves two people with opposite needs, and conflating them is why
this is hard.

- **Nikola** needs Croatian read aloud to him. Variety is good. Reading aloud
  is exposure even when the parent does not own the words.
- **Kevin** needs to learn. Depth is good. Repetition is the mechanism.

Therefore: **Priče keeps its weekly rotation exactly as it is.** The Monday
GitHub Action is untouched, and `nikola-learn`'s quiz gate keeps doing its
existing job. What gets narrow is the *drill*, not the *exposure*.

## Content model

### Items

Each story line decomposes into an ordered ladder of **items** — the unit the
scheduler tracks:

```js
{
  hr: "Tara udara loptu prema njemu.",
  en: "Tara kicks the ball toward him.",
  items: [
    { id: "w-loptu",       kind: "word",  hr: "loptu",            en: "the ball" },
    { id: "c-udara-loptu", kind: "chunk", hr: "udara loptu",      en: "kicks the ball" },
  ],
}
```

The full line is the ladder's top rung and is **scheduled as an item too**,
but it is not listed in `items` — it is derived, with the implicit id
`line`, taking its `hr`/`en` from the line itself. So the example above is
three scheduled cards, not two.

A line yields roughly three items: one or two words, a chunk, and the full
line. Across the bank's 130 lines that is ~400 items — a bounded, one-time
authoring job, not a recurring weekly cost. The bank is a fixed universe that
rotates; only newly authored variants need new decomposition.

`focusHr` / `focusEn` already on each variant (`"udarati loptu"` / `"to kick
the ball"`) is the same idea and should become the variant's headline word
item rather than a parallel concept.

### Variant ids

Items belong to a variant, not to a calendar week — `loptu` is the same word
in every week the variant appears. Variants currently have no id. Add a
stable `variantId` to each entry in `scripts/story-bank.js` so item audio is
generated once and reused, instead of being regenerated per week.

### Authoring

**The decomposition never invents Croatian.** Every item's `hr` is an exact
contiguous substring of a line that is already written and already passes
`croatian-checks.js`. Slicing cannot introduce a wrong case or a wrong verb
form, because no form is being produced — only selected. This is enforced by
a test, not by convention.

That leaves exactly one generated field: the item's **English gloss**. It is
drafted by script and then verified automatically against a dictionary, with
no human reviewer in the loop:

- Look the surface form up in **Wiktionary's Serbo-Croatian entries**, which
  carry declension and conjugation tables. `loptu` resolves to the lemma
  `lopta`; the drafted gloss must be consistent with that lemma's English
  sense.
- A lookup that fails, or a gloss that disagrees with every sense the
  dictionary lists, is written to a `needs-review` file rather than committed.
  Nothing unverified reaches the learner.
- Function words that dictionaries gloss poorly in isolation (`se`, `mu`,
  `još`) are held to a small hand-maintained allowlist, since their "meaning"
  is positional rather than lexical.

Results are cached to disk so the pass is offline and repeatable after the
first run, in the same spirit as the committed audio.

`croatian-checks.js` runs over item text the same way it runs over lines.

## Govori — the mode

A fourth tab beside Priče / Pjesme / Knjige.

```
EN voice: "Tara kicks the ball toward him."
          (silence — say it aloud)
HR voice: "Tara udara loptu prema njemu."

          [ Znam ]   [ Skoro ]   [ Ne znam ]
```

- The silence is derived from the answer clip's own duration rather than
  being a fixed number of seconds — a one-word item gets a short beat, a full
  sentence a long one. Same reasoning as `PHRASE_PAUSE_MULT`, and it reuses
  that multiplier.
- The three rating buttons are the only controls, sized for a glance rather
  than a read.
- Auto-advance to the next due item.
- A session ends when nothing is due, and says so.

### First encounter

When a line is first admitted, its items are introduced bottom-up in one
pass — word, then chunk, then the full line — so the sentence is assembled
out of pieces already spoken once. After that pass each item is an
independent card on its own clock.

This is the part that makes vocabulary stick: `loptu` can come due tomorrow
while the sentence it came from is not due for a week.

## Scheduling

Graduated interval recall, per item.

| Rating | Effect |
|---|---|
| `Znam` | advance one step |
| `Skoro` | hold at the current step, re-due in ~10 min (same session) |
| `Ne znam` | reset to step 0, re-due in ~1 min (same session) |

Ladder: `1m → 10m → 1d → 3d → 8d → 21d → 60d`.

An item answered `Znam` at the 21d step counts as **mastered**. Items from
retired stories keep surfacing; their audio is already committed, so nothing
needs regenerating when a story rotates out.

### Intake brake

This is the mechanism that delivers depth over breadth, and it is per item,
not per story:

- At most **5 new items admitted per calendar day**.
- **No new items at all while more than 10 items are overdue.**

Some days nothing new arrives. That is the feature. It also means the learner
never faces a wall of arrears, which is the usual way spaced repetition dies.

### Leeches

An item rated `Ne znam` four times is flagged as a leech. It keeps appearing,
but its interval stops resetting all the way to zero — it re-enters at the
`10m` step instead of `1m`, so one stubborn word cannot crowd out a whole
session. Leeches are listed on the Govori screen when a session ends, so a
persistent problem is visible rather than silently eating the queue.

## Kviz — format escalates per line

Kviz stays the eyes-on written surface and gains the typing Kevin asked for.
Difficulty is earned per line rather than fixed:

| State | Format |
|---|---|
| assembled correctly < 2 times | word tiles (as built 2026-09-12) |
| assembled correctly ≥ 2 times | type the Croatian |
| typed correctly ≥ 2 times | drops out of Kviz; lives in Govori only |

Speaking is the real test, so a line that has been written correctly twice
stops being asked in writing.

### Typing and diacritics

Typed answers are compared with diacritics folded (`c` matches `č`/`ć`,
`z` matches `ž`, `s` matches `š`, `d` matches `đ`). A fold-only match is
accepted and shows the correct form:

```
točno, ali: uči
```

It should test Croatian, not thumbs on a phone keyboard. Whitespace and
sentence-final punctuation are ignored the same way `lineWords()` already
ignores them.

## Data

A new `localStorage` key, `nikola-practice`, one record per item. Record keys
are `<storyId>|<variantId>|<itemId>` — variant-scoped, not week-scoped, so a
variant that comes around again resumes its existing schedule instead of
starting over:

```js
{
  "s-tara|v3|w-loptu": {
    step: 3,            // index into the interval ladder
    dueAt: 1789234567890,
    lapses: 1,          // Ne znam count, for leech detection
    introducedOn: "2026-09-12",
  }
}
```

Kviz's per-line counters (`timesAssembled`, `timesTyped`) live in the same
store keyed by line.

`nikola-learn` is **not** touched. It keeps holding last week's story until
that week's quiz is passed, exactly as `learn-gate.js` does today. The two
stores answer different questions and should not be merged.

`localStorage` can come back empty (cleared site data, a different browser,
private window). Every read is wrapped and a missing store simply means
everything is new — the app must never error on a cold store.

## Audio

`scripts/generate-audio.js` gains:

- An **English narrator voice** for prompts, distinct from Fran (the Croatian
  voice), so prompt and answer are never confusable.
- A `--items` pass writing `audio/items/<variantId>/<itemId>.{en,hr}.mp3`.

Everything Govori plays lives in the variant-keyed `audio/items/` tree,
**including the full line's English prompt and its Croatian answer.** Priče's
existing week-keyed `audio/<storyId>/<week>/lineNN.mp3` is left exactly as it
is and keeps serving the reading player. The duplication is deliberate: the
two trees are keyed differently on purpose, and rewriting Priče's layout to
share files is a refactor this design does not need.

Estimated one-time volume: ~400 English prompt clips plus ~400 Croatian
clips, roughly 800 short files. They are committed like the rest, generated
locally, and regenerated only when the bank changes — a variant's items are
generated once and reused every week that variant appears.

As today, generation prints the real text to the terminal and is run by hand;
the app itself never calls ElevenLabs and needs no key.

## Testing

Following the existing convention of small Node scripts under `scripts/`:

- `test-scheduler.js` — the interval ladder, the three ratings, the intake
  brake (no new items while overdue > 10; never more than 5 a day), leech
  flagging, and a cold/empty store.
- `test-items.js` — every line in the bank decomposes to at least one item;
  every item's `hr` actually occurs in its line; ids are unique and stable;
  `croatian-checks` passes over item text.
- `test-typing-answer.js` — diacritic folding accepts `uci` for `uči` and
  reports the correct form; genuinely wrong words still fail.
- Kviz format escalation extends `test-quiz-build.js`.

The Govori loop itself is DOM-bound and inline in `index.html`, so it is
verified in a browser the way the tile quiz was, with the scheduler logic
extracted into a plain module so the bulk of it is testable headlessly.

## Build order

Four phases, each independently useful and independently verifiable. Phase 1
is content with no user-visible change; nothing after it can start until it
lands, because every later phase consumes items.

1. **Items** — `variantId` on every variant, the decomposition script, the
   Wiktionary gloss check, `test-items.js`. Output is data, not UI.
2. **Scheduler** — `scripts/practice-scheduler.mjs` as a pure module (ladder,
   ratings, intake brake, leeches) plus `test-scheduler.js`. No DOM, fully
   headless, the bulk of the logic.
3. **Govori** — audio generation for items, then the eyes-free loop wired to
   the scheduler. Verified in a browser.
4. **Kviz typing** — format escalation and diacritic-folded matching. Fully
   independent of 2 and 3; could ship first if the speaking work stalls.

## Out of scope for v1

- **Backward buildup** (Pimsleur teaches long phrases from the end backward).
  The item ladder gets much of the benefit. Revisit once the loop is in use.
- **Speech recognition.** Explicitly rejected: unreliable for Croatian on a
  learner's accent, patchy on iOS Safari, and Pimsleur does not do it either.
- **Recombination** — generating novel sentences from known vocabulary, which
  is how Pimsleur produces the feeling of speaking rather than reciting. It
  needs a grammar the bank does not have. The single most valuable follow-up.

## Open questions

1. Is a fourth tab one too many? Kviz and Govori could eventually merge into
   one "practice" surface that chooses eyes-free or eyes-on by context.
2. Is 5 new items a day the right intake? It is deliberately slow. Easy to
   retune — it is one constant.
3. Should Govori draw only from stories currently in rotation, or from the
   entire bank once items exist? The spec assumes rotation-only at admission
   time, with items persisting after their story retires.
