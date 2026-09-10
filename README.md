# Nikola

A tiny app for reading simple, repetitive Croatian to a baby — and for the parent to **learn Croatian** while doing it. Plain HTML/CSS/JS, no build step. Phone propped screen-toward-you as a teleprompter.

## Priče (the Croatian course)

Four short present-tense stories a week, 10 lines of 5–6 words each. Same four all week. Tara (2) shows Nikola big-kid play; baka is staying in the house; one outing with mama or tata; one “this season” card (Boston / krštenje / birthdays).

**How to use a line:** look at the Croatian → hear the clip at normal speed → **say it yourself in the pause**. English is a gloss, not the script. No Polako.

**Kviz:** after you finish a story, take five English→Croatian questions. You need 4/5. A story is **not replaced** the next Monday until that quiz is passed (the app keeps last week’s card until then).

Stories are generated from `scripts/story-bank.js` by `scripts/update-weekly-stories.js`. Do not edit `stories.js` by hand.

- `stories.js` — this week’s four stories (plus last week, for the quiz gate).
- `index.html` — home, player, quiz, songs, books. Selecting a story is a same-page view switch so iOS Safari still allows `audio.play()` from the tap.
- `audio/<storyId>/<weekDate>/lineNN.mp3` — narration, committed to the repo.
- `songs.js` / `books.js` — unchanged sections (Pjesme, Knjige). Books use the same player at normal speed. **Never generate copyrighted book or song text with an assistant.**

## Adding a book

`books.js` holds one object per book: `{ id, emoji, titleHr, titleEn, lines: [{hr, en}] }` - the same shape as a story. Break `lines` wherever makes sense to you (a whole page, one sentence, part of a sentence) - there's no fixed rule. Edit `books.js` directly.

**Never generate, transcribe, or translate a real book's text via an AI assistant.** Book text is copyrighted; type in the English original and your own Croatian translation yourself, from the physical book in hand. This app is a reading companion used alongside the book, not a replacement for it - no page images are stored, just the text you choose to add.

Once a book's `lines` are filled in, generate its audio the same way as stories (see below) - `scripts/generate-audio.js` processes `books.js` and `stories.js` together (pass an id to regenerate just one entry, e.g. `node scripts/generate-audio.js my-book-id`). **Book audio saves to `book-audio/<bookId>/`, not `audio/`**, and is committed with the repo so Knjige playback works when the app is opened from GitHub. Run the generation script yourself, locally - it prints the real text to your terminal as it goes, which should never pass through a chat session.

## Adding a song / filling in lyrics

`songs.js` holds one object per song: `{ id, title, artist, key, capo, sections: [{ label, chords, lines }] }`. `chords` is that section's chord progression (shown on the performance screen's chord widget); `lines` is an array with one entry per lyric line, meant to be filled in by hand later — new sections are added with each line as an empty string (`""`) as a placeholder.

**Never generate, transcribe, or paste song lyrics via an AI assistant** — lyrics are copyrighted, so `lines` should only ever be typed in yourself, from memory or a lyric sheet you already have.

There's no audio for songs — unlike stories, the guitar and vocals are played live, so the performance screen only shows chords and scrolls lyric text; it never touches `<audio>`.

## Generating audio (ElevenLabs)

Audio is pre-generated once, offline, and committed — the app itself never calls ElevenLabs or needs an API key.

Default voice: **Fran — Calm, Narrative** (`TRnNlYQWHAJwo9K75wNE`), a warm, medium-to-deep Croatian male voice trained on studio-quality audiobook/documentary narration. Delivery is slowed slightly (`speed: 0.85` in `scripts/generate-audio.js`) for clarity.

1. Put your ElevenLabs API key in a local `.env` file (gitignored) as `ELEVENLABS_API_KEY=...`, or export it as an env var.
2. Run:
   ```
   node scripts/generate-audio.js --stories --force
   ```
   This regenerates **this week’s** (and last week’s, if present) story lines. Books: omit `--stories` or pass `--books`. Pass an `id` to do one entry. Override voice with `ELEVENLABS_VOICE_ID`.

   The Monday GitHub Action (`.github/workflows/weekly-stories.yml`) runs the same thing after `update-weekly-stories.js`. Add repo secret `ELEVENLABS_API_KEY` and allow Actions read/write on contents, then run **Weekly stories** once by hand.

3. Review the generated MP3s, then commit them.

Requires Node 18+ (uses the built-in `fetch`). No `npm install` needed.

## Running locally

From this folder:
```
npx serve
```
Open the printed URL in a browser, or on your phone (same WiFi) via your computer's local IP, e.g. `http://192.168.1.23:3000`.

## Deploying (GitHub Pages)

1. Push this repo to GitHub (public).
2. In the repo settings, enable GitHub Pages, serving from the `main` branch root.
3. On your iPhone, open the Pages URL in Safari, then Share → Add to Home Screen for a fullscreen app icon.

## Notes

- This repo is intentionally separate from any other personal/family repo — it should only ever contain story text, audio, and app code, since it's meant to be public.
- Selecting a story calls `audio.play()` synchronously inside the tap's click handler (see above) so the first line autoplays on iOS Safari, which otherwise blocks autoplay after any page load that isn't tied to a live user gesture. If a story is opened via a direct/bookmarked `?story=` URL (no tap involved), the first line won't autoplay; tapping "Ponovi" once still works as a manual fallback. Line-to-line playback always auto-advances regardless.
