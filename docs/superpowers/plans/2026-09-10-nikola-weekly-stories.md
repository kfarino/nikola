# Weekly Nikola stories — implementation plan

**Goal:** Four present-tense family stories a week (10 lines of 5–6 word chunks each), normal-speed audio, echo pause, regenerated every Monday.

**Architecture:** Keep the existing static app. A small `scripts/story-bank.js` holds a few variants per slot. `scripts/update-weekly-stories.js` writes `stories.js` for the current Zagreb week (`s-sada` is calendar-aware). GitHub Actions regenerates audio with ElevenLabs and commits. The player drops Polako and treats each line as one phrase.

**Tech stack:** Vanilla HTML/CSS/JS, Node 18+ scripts, no npm dependencies. GitHub Actions + Pages. ElevenLabs remains offline TTS, same Fran voice.

## Global constraints

- No build step, no framework.
- Present tense only; 5–6 Croatian words; 10 lines; Tara is a one-year-old cousin.
- Baka stories are “she lives with us this month,” not a trip to her house.
- Teta Emma and barba Marco appear only as guests in birthday/krštenje lines.
- Do not touch real book/song text. Do not invent Boston names.
- Do not call ElevenLabs from the client.
- Books keep working on the shared player at normal speed (no Polako).
- Animal story audio folders are deleted; new ids are `s-tara`, `s-baka`, `s-odlazak`, `s-sada`.

---

### Task 1: Present-tense phrase checks

**Files:**
- Create: `scripts/croatian-checks.js`

- [ ] Word count 5–6 after stripping punctuation
- [ ] Reject Croatian perfect (l-participles / *je vidio*) and future clitic *će* as its own word (not the *će* inside *hoće*)
- [ ] Export helpers for the generator and validator

---

### Task 2: Story bank (the content)

**Files:**
- Create: `scripts/story-bank.js`

Four slots, **few variants**, 10 lines each. Present tense even for the Boston trip (*Nikola sjedi u avionu*) and for krštenje (*obitelj ide u crkvu*).

| Slot | Variants |
| --- | --- |
| `s-tara` | 3: park (Tara sits/crawls) · ku-ku / ball · dancing (Tara bounces, claps) |
| `s-baka` | 4: morning in this house · market for food · cooking together · opera |
| `s-odlazak` | 3 mama (museum, neighborhood, both-in-one walk) + 3 tata (bike, ocean/surf, sports). Generator uses mama set on odd weeks, tata set on even weeks. |
| `s-sada` | Calendar, not random: krštenje if that is still next; else Boston plane / dad’s relatives / ocean beach until October; **mama’s birthday in October**; **baka’s birthday in November**; **Tara’s birthday in December**. Birthday stories can mention teta Emma and barba Marco as guests. |

Tara-as-baby language: *sjedi, puzi, plješće, smije se, nosi Taru*. Never peer sports.

- [ ] Write the bank
- [ ] Generator (Task 3) must fail the bank on any bad line

---

### Task 3: Weekly generator + validator

**Files:**
- Create: `scripts/update-weekly-stories.js`
- Create: `scripts/validate-stories.js`
- Write: `stories.js` (generated)

- [ ] Week key = Monday of the current `Europe/Zagreb` week
- [ ] `s-sada` from month (and krštenje/Boston priority in the spec)
- [ ] `s-odlazak` mama vs tata by odd/even week number
- [ ] Other slots: `(weekNum + slotIndex) % variants.length`
- [ ] Write `STORY_DATE` (that Monday), `STORY_DATE_HR` (`tjedan 8. rujna 2026.`), `STORIES`
- [ ] Audio paths only: `audio/<id>/lineNN.mp3` — no slow halves
- [ ] Validator: exactly 4 stories, 10 lines, present tense, 5–6 words, no Polako fields

---

### Task 4: Audio script (normal speed, stories-only force)

**Files:**
- Modify: `scripts/generate-audio.js`

- [ ] Load `.env` for local runs
- [ ] `--force`, `--stories`, `--books`, optional `[id]`
- [ ] Synthesize only `line.hr` at speed `0.85`; delete the story folder on `--force`
- [ ] Retry 429s; do not generate books on the weekly job

---

### Task 5: Player — chunks, no Polako, week label

**Files:**
- Modify: `index.html`

- [ ] Remove Normalno / Polako toggle and all `slowMode` / half-clip logic
- [ ] `audio.src = line.audio`; pause multiplier `1` after each phrase
- [ ] Home eyebrow `✨ Nikola · ${STORY_DATE_HR}`
- [ ] Card meta: `focusHr · N fraza`
- [ ] Books still use this player (normal speed)

---

### Task 6: Monday GitHub Action

**Files:**
- Create: `.github/workflows/weekly-stories.yml`
- Create: `.github/workflows/validate-stories.yml`

- [ ] Cron `0 5 * * 1` + `workflow_dispatch`, `contents: write`
- [ ] Generate → validate → `generate-audio.js --stories --force` → commit `stories.js` + `audio/`
- [ ] PR CI: regenerate + validate bank (no ElevenLabs)

---

### Task 7: README + cleanup

**Files:**
- Modify: `README.md`
- Delete: `audio/turtle`, `audio/rabbit`, `audio/squirrel`, `audio/penguin`, `audio/star`, `audio/noisy-dog`, `audio/rainbow-worm`

- [ ] Document weekly cadence, four-story limit, present tense, how to use (listen, glance at English only if needed, say the chunk in the pause)
- [ ] Document secret `ELEVENLABS_API_KEY` and Actions write permission
- [ ] Stories are generated from the bank — do not edit `stories.js` by hand
- [ ] Remove animal MP3s so old ids cannot play

---

### Task 8: First audio

After merge (or via `workflow_dispatch` once the secret exists):

- [ ] Add repo secret `ELEVENLABS_API_KEY`
- [ ] Actions → workflow permissions → Read and write
- [ ] Run **Weekly stories** once so this week’s MP3s exist on Pages

Until that runs, missing clips already advance after a short pause (existing audio `error` handler).
