# Nikola

A tiny app for reading simple, repetitive Croatian stories to a baby. Plain HTML/CSS/JS, no build step, no framework. Meant to run on a phone propped up screen-toward-you as a teleprompter while you face your kid.

## How it works

- `stories.js` — all story text (Croatian + English), one entry per line.
- `index.html` — the whole app: a home screen (lists the stories) and a player screen (shows one line at a time, Croatian large, English below, plays that line's audio, and auto-advances when it finishes; tap "Ponovi" to replay). Both live in one page — selecting a story swaps the view with JS (`history.pushState`, no real navigation) instead of loading a separate page, so the tap that picks a story is still an active user gesture when `audio.play()` is called. That's required for the first line to autoplay on iOS Safari; a real page load would lose the gesture and autoplay would get blocked.
- `audio/<storyId>/lineNN.mp3` — pre-generated narration, one file per line, committed to the repo.
- `songs.js` — song chords and lyrics, one entry per song. Reachable via the "Pjesme" tab next to "Priče" on the home screen. Picking a song opens a chord-preview screen (title, artist, key/capo, and each section's chord progression) with a "Sviraj" button; tapping it opens a performance screen with a big chord widget for the current section and an auto-scrolling lyric line, plus prev/next-section, pause, and speed controls, meant to be propped up while you play guitar and sing live.
- `books.js` — Croatian reading-companion text for physical books, one entry per book, same shape and audio pipeline as `stories.js`. Reachable via the "Knjige" tab. Uses the exact same player screen as Priče (large Croatian line, English below, Polako slow mode, pause) - Books and Stories are read identically.

## Adding or editing a story

1. Edit `stories.js` — add a story object (`id`, `titleHr`, `titleEn`, `lines: [{hr, en}]`) or change existing line text. Don't hand-write the `audio` path — it's filled in automatically from `id` + line position.
2. Regenerate audio for that story (see below) so the MP3s match the new text.
3. Commit the updated `stories.js` and the new/changed MP3s together.

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
   node scripts/generate-audio.js
   ```
   This regenerates **every** line for **every** story and book using the default voice above. To try a different voice, browse https://elevenlabs.io/app/voice-library and pass `ELEVENLABS_VOICE_ID=...`. It overwrites existing files, so it's safe to re-run any time story text changes.

   To regenerate just one story or book (e.g. after editing a single book, so you don't re-synthesize and rewrite every other unchanged story/book's already-committed MP3s), pass its `id` as an argument:
   ```
   node scripts/generate-audio.js my-book-id
   ```
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
