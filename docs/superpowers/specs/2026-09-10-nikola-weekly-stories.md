# Nikola's weekly stories (parent Croatian learning tool)

## Goal

Replace the animal bedtime fables with **a few of Nikola’s real-family adventures**. Priče becomes a Croatian **learning tool for the parent** who reads aloud: present-tense, 5–6 word chunks, normal-speed audio, a pause after each phrase to echo.

**Less is more.** Four short stories stay up for **one week** (about forty phrases, not eighty). You live with the same chunks Monday–Sunday. A Monday job rewrites the four and regenerates audio.

## Language-learning stack (what we are using, and why)

No single method wins. This app already sits in the best seat: you speak Croatian out loud, to Nikola, on a phone teleprompter.

| Technique | Evidence | In this app |
| --- | --- | --- |
| Present tense first | Beginner sequences teach present before past (here-and-now / TPR, CEFR A1). Croatian past (*je vidio / išla / dali*) adds auxiliary + gender on every verb. | **Every line is present tense.** The old fables (*živjela je, plivala je*) are the wrong verb diet for collecting vocabulary. Past can be a later bank. |
| Lexical chunks | Fluency is retrieved in multi-word units (Lewis; Wray), not word-by-word grammar. | **Each pause is one 5–6 word Croatian phrase** — one clip, one breath. |
| Shadowing / echo | Imitating native-speed speech after a short model. | **Normal speed only** (no Polako). After each clip, wait about one clip-length, then auto-advance. |
| Narrow reading | Same people and places, new details — vocabulary sticks. | Four cards. Same text all week. |
| Weekly spacing | A little every day beats a binge; too many stories, or a new set every day, fights memorization. | Four stories Monday–Sunday. New set + new audio each Monday. |
| Personal relevance | Names and routines you live beat textbook people. | Baka staying for a month, Tara (2, walks and talks), mama/tata outings, and whatever is actually on the calendar (Boston, krštenje, birthdays). |
| Output from day one | Speaking exposes gaps input hides. | Reading aloud *is* the speaking practice. |

Not adding: flashcards, a second study mode, slow audio, grammar lectures, mixing past tense, or a home screen full of cards you will not reread.

## Four stories (not seven)

Tara is Nikola’s **two-year-old cousin**. She **walks, runs, and talks** — park, games, and dancing are real play, not a baby being carried. She says short things (*Tara kaže “još”*, *Tara zove Nikolu*). She is still little: no solo bike, no peer sports with tata.

Baka is **staying with the family for a month**, so her stories are life in *this* house (*baka kuha u kuhinji*, *baka sjedi s Nikolom*), not a visit to hers.

Teta Emma and barba Marco do **not** get their own cards. They show up as guests in birthday and krštenje stories. Dedicated Emma/Marco adventures can wait.

Name in the learning lines: **Nikola** (one form to learn). *Nikolica* is the pet name at home; we do not mix diminutives into the chunks.

Four stable `id`s (audio folders stay put). Each week each slot has **one** 10-line story.

| id | Card | What it is |
| --- | --- | --- |
| `s-tara` | Tara | Park (they run) · games (ku-ku, ball) · dancing. Tara walks, runs, and talks. |
| `s-baka` | Baka (living here) | Mornings at home · market for food · cooking together · opera. |
| `s-odlazak` | Mama *or* tata | One outing, not both. Odd weeks: mama (museum / neighborhood walk). Even weeks: tata (bike / beach-surf / sports). |
| `s-sada` | This season | **Calendar picks the story**, not a random shuffle. |

### `s-sada` calendar

Told in present tense as if it is happening now.

| When | Story |
| --- | --- |
| Until the baptism, if that is next | Getting ready for **krštenje** (crkva, bijela odjeća, obitelj, voda — not sacramental text) |
| Otherwise, before October | Boston trip: **plane**, **dad’s relatives** (*tatina obitelj*, *rođaci* — no invented names), **ocean at the beach** |
| October | **Mama’s birthday** |
| November | **Baka’s birthday** (she is here) |
| December | **Tara’s birthday** |

Emma and Marco can appear in the birthday and krštenje lines (*teta Emma donosi tortu*, *barba Marco sjedi za stolom*) without needing their own adventures.

## Phrase rules

- Croatian **5 or 6 words** (punctuation does not count)
- **10 lines** per story
- Present tense only (validator rejects *je* + l-participle and standalone *će*)
- English gloss under the Croatian (safety net, not what you read aloud)
- High-frequency verbs for that adventure
- Correct case (*s bakom, s Tarom, Tari*)
- No quotation-mark dialogue (TTS). Report speech: *Baka kaže da je lijepo.*
- Card shows `focusHr` plus phrase count

## Player

- Remove **Polako**. Stories and books play at the existing Fran speed (`0.85`).
- Drop slow-half MP3s and `splitSentence` for stories.
- After a clip: pause ≈ **1× duration**, then next phrase.
- Home eyebrow: `✨ Nikola · tjedan 8. rujna` so it is obvious the set is this week’s.

## Weekly job

`.github/workflows/weekly-stories.yml`

1. Cron `0 5 * * 1` (Monday 05:00 UTC ≈ 06:00/07:00 Croatia) plus `workflow_dispatch`
2. `node scripts/update-weekly-stories.js` writes `stories.js` from the bank, keyed by the Monday of the current Europe/Zagreb week
3. `node scripts/validate-stories.js --bank` (exactly 4 stories, 10 lines, 5–6 words, present tense)
4. `node scripts/generate-audio.js --stories --force` rebuilds `audio/<id>/lineNN.mp3` only (not books)
5. Commit `stories.js` + `audio/` and push to `main` (Pages deploys)

Needs repo secret **`ELEVENLABS_API_KEY`**. Text and audio ship together; if the key is missing the job fails on purpose.

Story text is a **curated Croatian bank**, not an LLM. `s-sada` follows the calendar table above; the other three slots cycle a small variant list.

Setup after merge: add `ELEVENLABS_API_KEY` in repo secrets; set Actions workflow permissions to read and write; run **Weekly stories** once by hand.

## Out of scope

- Do not invent, translate, or regenerate book/song text
- Do not invent names for Boston relatives
- Do not call ElevenLabs from the phone
- Do not reintroduce Polako or past-tense narration
- Do not change stories mid-week
- Do not add Emma/Marco/animal/business cards in this pass
