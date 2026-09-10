# Weekly Nikola stories — implementation plan

**Goal:** Turn Priče into a weekly, present-tense Croatian learning tool: six family-adventure stories in 5–6 word chunks, normal-speed audio, echo pause, regenerated every Monday.

**Architecture:** Keep the existing static app. A curated `scripts/story-bank.js` holds variants per family slot. `scripts/update-weekly-stories.js` writes `stories.js` for the current Zagreb week. GitHub Actions regenerates audio with ElevenLabs and commits. The player drops Polako and treats each line as one phrase.

**Tech stack:** Vanilla HTML/CSS/JS, Node 18+ scripts, no npm dependencies. GitHub Actions + Pages. ElevenLabs remains offline TTS, same Fran voice.

## Global constraints

- No build step, no framework.
- Present tense only; 5–6 Croatian words per line; Tara is a one-year-old cousin.
- Do not touch real book/song text.
- Do not call ElevenLabs from the client.
- Books keep working on the shared player at normal speed (no Polako).
- Animal story audio folders are deleted; new ids are `s-baka`, `s-mama`, `s-tara`, `s-tata`, `s-emma`, `s-marco`.

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

Six slots, **six variants each** (one week of unique combinations for a long time; 6 weeks before a given slot repeats a variant). Each variant is 12 lines.

| Slot | Variants cover |
| --- | --- |
| `s-baka` | 2× market (fruit/veg, bread/cheese), 2× cooking (juha, tijesto), 2× opera (getting ready, sitting in the hall) |
| `s-mama` | 3× museum/art (paintings, sculpture, looking close), 3× neighborhood walk (street, shop windows, neighbors) |
| `s-tara` | 2× park (grass, stroller/sandbox — Tara sits/crawls), 2× games (ku-ku, rolling a ball to Tara), 2× dancing (Tara bounces, claps) |
| `s-tata` | 2× bike (tata holds, Nikola rides slowly), 2× surf (shore + sitting on the board with tata), 2× sports (football, running) |
| `s-emma` | 6 animal meetings (cat, dog, chickens, goats, birds, fish) |
| `s-marco` | 6 business scenes (open shop, customer, count money, boxes, phone, market stall) |

Tara-as-baby language: *sjedi, puzi, plješće, smije se, mama/nika nosi Taru*. Never peer sports.

- [ ] Write the bank
- [ ] `node scripts/update-weekly-stories.js` (Task 3) must fail the bank on any bad line

---

### Task 3: Weekly generator + validator

**Files:**
- Create: `scripts/update-weekly-stories.js`
- Create: `scripts/validate-stories.js`
- Write: `stories.js` (generated)

- [ ] Week key = Monday of the current `Europe/Zagreb` week
- [ ] Pick variant `(weekNum * 5 + slotIndex * 3) % variants.length`
- [ ] Write `STORY_DATE` (that Monday), `STORY_DATE_HR` (`tjedan 8. rujna 2026.`), `STORIES`
- [ ] Audio paths only: `audio/<id>/lineNN.mp3` — no slow halves
- [ ] Validator: 6 stories, present tense, 5–6 words, each slot’s companion appears, no Polako fields

---

### Task 4: Audio script (normal speed, stories-only force)

**Files:**
- Modify: `scripts/generate-audio.js`

- [ ] Load `.env` for local runs
- [ ] `--force`, `--stories`, `--books`, optional `[id]`
- [ ] Synthesize only `line.hr` at speed `0.85`; delete the story folder on `--force` so leftover line counts disappear
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

- [ ] Document weekly cadence, present tense, how to use (listen, glance at English only if needed, say the chunk in the pause)
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
