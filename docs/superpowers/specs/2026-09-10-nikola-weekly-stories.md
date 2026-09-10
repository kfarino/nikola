# Nikola's weekly stories (parent Croatian learning tool)

## Goal

Replace the animal bedtime fables with **Nikola’s real-family adventures**. Priče becomes a Croatian **learning tool for the parent** who reads aloud: present-tense, 5–6 word chunks, normal-speed audio, a pause after each phrase to echo.

The six stories stay up for **one week**, then a scheduled job rewrites all six and regenerates audio. Weekly is the right cadence now that each family member has several distinct adventures — you repeat the same chunks all week (that is the learning), then get a fresh set on Monday.

## Language-learning stack (what we are using, and why)

No single method wins. This app already sits in the best seat: you speak Croatian out loud, to Nikola, on a phone teleprompter.

| Technique | Evidence | In this app |
| --- | --- | --- |
| Present tense first | Beginner sequences teach present before past (here-and-now / TPR, CEFR A1). Croatian past (*je vidio / išla / dali*) adds auxiliary + gender on every verb. | **Every line is present tense.** The old fables (*živjela je, plivala je*) are the wrong verb diet for collecting vocabulary. Past can be a later bank. |
| Lexical chunks | Fluency is retrieved in multi-word units (Lewis; Wray), not word-by-word grammar. | **Each pause is one 5–6 word Croatian phrase** — one clip, one breath. |
| Shadowing / echo | Imitating native-speed speech after a short model. | **Normal speed only** (no Polako). After each clip, wait about one clip-length, then auto-advance. |
| Narrow reading | Same people and places, new details — vocabulary sticks. | Six stable slots (one companion each). The week’s text does not change. |
| Weekly spacing | A little every day beats a binge; *changing* the text every day fights memorization. | Same six stories Monday–Sunday. New set + new audio each Monday. |
| Personal relevance | Names and routines you live beat textbook people. | Baka, mama, Tara, tata, teta Emma, barba Marco, doing what they actually do. |
| Output from day one | Speaking exposes gaps input hides. | Reading aloud *is* the speaking practice. |

Not adding: flashcards, a second study mode, slow audio, grammar lectures, or mixing past tense in.

## Characters and adventures

Tara is Nikola’s **one-year-old cousin**, not a same-age playmate. She crawls, sits, claps, is carried, giggles, dances in place. She does not kick a football, ride a bike, or climb a slide as an equal.

Six stable slots (stable `id`s so audio folders stay put). Each week, each slot picks **one** 12-line adventure from that slot’s bank.

| id | Companion | Adventures (variants rotate by week) |
| --- | --- | --- |
| `s-baka` | baka | Market to buy food · cooking · the opera |
| `s-mama` | mama | Museums / looking at art · walking the neighborhood |
| `s-tara` | Tara (1yo cousin) | Park · simple games (ku-ku, rolling a ball) · dancing |
| `s-tata` | tata | Bikes · surfing · sports |
| `s-emma` | teta Emma | Meeting animals (farm, cat, dog, birds, …) |
| `s-marco` | barba Marco | Learning about business (shop, customers, counting, boxes) |

Nikola is in every story. Tara is the focus of `s-tara`; she may tag along as a baby in other stories where it is natural (stroller at the market, on mama’s walk) but is not forced into the opera or the shop floor.

Name in the learning lines: **Nikola** (one form to learn). *Nikolica* is the pet name at home; we do not mix diminutives into the chunks.

## Phrase rules

- Croatian **5 or 6 words** (punctuation does not count)
- Present tense only (validator rejects *je* + l-participle and standalone *će*)
- English gloss under the Croatian (safety net, not what you read aloud)
- High-frequency verbs for that adventure (*kupovati, kuhati, gledati, hodati, igrati se, voziti, plivati, …*)
- Correct case (*kod bake, s Tarom, Tari, teti Emmi*)
- No quotation-mark dialogue (TTS). Report speech: *Baka kaže da je lijepo.*
- Card shows `focusHr` (the week’s verb pattern) plus phrase count

## Player

- Remove **Polako**. Stories and books play at the existing Fran speed (`0.85`).
- Drop slow-half MP3s and `splitSentence` for stories.
- After a clip: pause ≈ **1× duration**, then next phrase.
- Home eyebrow: `✨ Nikola · tjedan 8. rujna` so it is obvious the set is this week’s.

## Weekly job

`.github/workflows/weekly-stories.yml`

1. Cron `0 5 * * 1` (Monday 05:00 UTC ≈ 06:00/07:00 Croatia) plus `workflow_dispatch`
2. `node scripts/update-weekly-stories.js` writes `stories.js` from the bank, keyed by the Monday of the current Europe/Zagreb week
3. `node scripts/validate-stories.js --bank` (word count, present tense, each companion appears in their slot)
4. `node scripts/generate-audio.js --stories --force` rebuilds `audio/<id>/lineNN.mp3` only (not books)
5. Commit `stories.js` + `audio/` and push to `main` (Pages deploys)

Needs repo secret **`ELEVENLABS_API_KEY`**. Text and audio ship together; if the key is missing the job fails on purpose.

Story text is a **curated Croatian bank**, not an LLM. Week index picks one variant per slot so grammar stays correct.

Setup after merge: add `ELEVENLABS_API_KEY` in repo secrets; set Actions workflow permissions to read and write; run **Weekly stories** once by hand.

## Out of scope

- Do not invent, translate, or regenerate book/song text
- Do not call ElevenLabs from the phone
- Do not reintroduce Polako or past-tense narration
- Do not change stories mid-week
