# Nikola's weekly stories (parent Croatian learning tool)

## Goal

Replace the animal bedtime fables with **a few of Nikola’s real-family adventures**. Priče becomes a Croatian **learning tool for the parent** who reads aloud: present-tense, 5–6 word chunks, normal-speed audio, a pause after each phrase to echo.

**Less is more.** Four short stories stay up for **one week** (40 phrases, not eighty). You live with the same chunks Monday–Sunday. A Monday job rewrites the four and regenerates audio.

## How you learn Croatian

You are the learner. Nikola hears the language; you acquire it by using it. The phone is a teleprompter so your face stays on him — that is also why there is no flashcard mode. The learning has to happen **in the read-aloud**.

### What one week actually does

40 phrases × 7 nights is the course. Night 1 is input (you mostly read). Nights 2–4 the pause becomes recall (you say the chunk, then check). Nights 5–7 are fluency of *this* week’s 40. Monday the costumes change; the same verbs come back in new sentences (narrow reading). That is spaced repetition without Anki.

If the set changed every day you would never finish a forgetting curve. If there were seven cards you would skip. Four is the load you can actually repeat.

### The loop (do this, or the app is just a story)

Each phrase is one clip at **normal speed**, then a pause about as long as the clip.

1. **Look at the Croatian.** That is what you say to Nikola.
2. **Hear Fran** say the same chunk.
3. **In the pause, say it yourself** — out loud, still to him. This is the learning. English is only if you are stuck.
4. Next chunk. **Ponovi** if that one did not stick.

Do not read the English aloud. It is a gloss, not the script. By mid-week try the pause **before** you peek at English. If you can say the line without it, that chunk is yours.

The card’s `focusHr` is the 1–2 verbs or patterns to notice that night (*htjeti*, *s bakom*, *Tara kaže hajde*). One noticing target beats a grammar lesson.

### What the four cards train

| Card | You get | Recycled shapes |
| --- | --- | --- |
| Tara | Play verbs + “come on” talk | *hajde, pokazuje, penje se, udara, ide za njom* |
| Baka at home | House, food, care | *kuha, kupuje, daje, sjedi, jede* |
| Mama or tata | Going somewhere | *ide, gleda, hoda* / *vozi, pliva, trči* |
| This season | The week’s real life (trip, krštenje, birthday) | Same verbs in a new place: *ide, vidi, sjedi, pjeva* |

Every week the bank must reuse a **small core**, not a new textbook chapter:

- Verbs: *ići, vidjeti, htjeti, dati, reći/kaže, jesti, biti* (*je/su* as now, never *bio je*)
- People in cases, in the chunk: *s Tarom, s bakom, Nikoli, Tari, u parku, u kuhinji, na moru*
- Tara-leads: *kaže hajde, zove Nikolu, ide prva*

Croatian case is not a table here. You learn *s bakom* as one piece, the way you will actually say it when baka is in the kitchen.

### Honest limits

These stories build **listening, pronunciation, and speaking in the 3rd person** (*Tara trči, baka kuha*). That is what a parent narrates. They do **not** train “I/you” conversation (*trčim, hoćeš li*). Imperatives from Tara (*hajde*) are the extra. For *ja/ti* you still need real talk with family — the stories make that talk easier because the verbs and cases are already in your mouth.

No past tense until this present core is easy. No Polako: slow audio teaches a voice that Croatians do not use; the pause is where you go slow.

### How you know it is working

By Sunday you can say most of the 40 chunks in the pause without the English. Next week a few of those verbs show up again and feel cheap. If a week feels like noise, read fewer cards — two stories done properly beat four skimmed.

## Why this shape (short)

| Technique | In this app |
| --- | --- |
| Present tense first | Every line. Old fables used *živjela je* — that is extra grammar, fewer verbs. |
| Chunks (Lewis / Wray) | 5–6 words = one breath = one clip = one pause. |
| Shadowing | Normal speed; you copy in the pause. |
| Narrow reading | Same people, same week, new details on Monday. |
| Personal relevance | Your house, your baka, Tara as the big kid, this month’s birthday. |

Not adding: flashcards, a second study mode, slow audio, grammar lectures, mixing past tense, or a home screen full of cards you will not reread.

## Four stories (not seven)

Tara is Nikola’s **two-year-old cousin**. She walks, runs, and talks — and she is the one who **introduces him to fun big-kid things**. Pattern every Tara story: Tara goes first (*Tara se penje, Tara udara loptu, Tara kaže hajde*), then Nikola copies. Slide, swing, a real kick of the ball, a race, a dance she already knows. She talks him into it (*Tara zove ga gore*). Tata still owns bikes/surf/sports outings; Tara owns the “I am the big kid, come on” play.

Baka is **staying with the family for a month**, so her stories are life in *this* house (*baka kuha u kuhinji*, *baka sjedi s Nikolom*), not a visit to hers.

Teta Emma and barba Marco do **not** get their own cards. They show up as guests in birthday and krštenje stories. Dedicated Emma/Marco adventures can wait.

Name in the learning lines: **Nikola** (one form to learn). *Nikolica* is the pet name at home; we do not mix diminutives into the chunks.

Four stable `id`s (audio folders stay put). Each week each slot has **one** 10-line story.

| id | Card | What it is |
| --- | --- | --- |
| `s-tara` | Tara | She shows Nikola big-kid play: slide/swing, ball, dancing. Tara first, Nikola follows. |
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
- Card shows `focusHr` — **one noticing target** for that story (a verb or a case chunk), not a slogan
- Across a generated week, the four stories together must use the core verbs *ići, vidjeti, htjeti, dati, kaže* at least once each (validator)

## Player

- Remove **Polako**. Stories and books play at the existing Fran speed (`0.85`).
- Drop slow-half MP3s and `splitSentence` for stories.
- After a clip: pause ≈ **1× duration**, then next phrase. That pause is the parent’s repetition slot, not dead air.
- Home eyebrow: `✨ Nikola · tjedan 8. rujna`
- Under the story list, one muted line: `Slušaj. U pauzi ponovi.` so the loop is on the phone, not only in the README.

## Weekly job

`.github/workflows/weekly-stories.yml`

1. Cron `0 5 * * 1` (Monday 05:00 UTC ≈ 06:00/07:00 Croatia) plus `workflow_dispatch`
2. `node scripts/update-weekly-stories.js` writes `stories.js` from the bank, keyed by the Monday of the current Europe/Zagreb week
3. `node scripts/validate-stories.js --bank` (exactly 4 stories, 10 lines, 5–6 words, present tense; week’s set contains core verbs *ići, vidjeti, htjeti, dati, kaže*)
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
