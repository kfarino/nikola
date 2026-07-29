# Vrijeme za priču

A tiny app for reading simple, repetitive Croatian stories to a baby. Plain HTML/CSS/JS, no build step, no framework. Meant to run on a phone propped up screen-toward-you as a teleprompter while you face your kid.

## How it works

- `stories.js` — all story text (Croatian + English), one entry per line.
- `index.html` — home screen, lists the stories.
- `player.html` — shows one line at a time (Croatian large, English below), plays that line's audio, and auto-advances to the next line when the audio finishes. Tap "Ponovi" to replay the current line.
- `audio/<storyId>/lineNN.mp3` — pre-generated narration, one file per line, committed to the repo.

## Adding or editing a story

1. Edit `stories.js` — add a story object (`id`, `titleHr`, `titleEn`, `lines: [{hr, en}]`) or change existing line text. Don't hand-write the `audio` path — it's filled in automatically from `id` + line position.
2. Regenerate audio for that story (see below) so the MP3s match the new text.
3. Commit the updated `stories.js` and the new/changed MP3s together.

## Generating audio (ElevenLabs)

Audio is pre-generated once, offline, and committed — the app itself never calls ElevenLabs or needs an API key.

Default voice: **Fran — Calm, Narrative** (`TRnNlYQWHAJwo9K75wNE`), a warm, medium-to-deep Croatian male voice trained on studio-quality audiobook/documentary narration. Delivery is slowed slightly (`speed: 0.85` in `scripts/generate-audio.js`) for clarity.

1. Put your ElevenLabs API key in a local `.env` file (gitignored) as `ELEVENLABS_API_KEY=...`, or export it as an env var.
2. Run:
   ```
   node scripts/generate-audio.js
   ```
   This regenerates **every** line for **every** story using the default voice above. To try a different voice, browse https://elevenlabs.io/app/voice-library and pass `ELEVENLABS_VOICE_ID=...`. It overwrites existing files, so it's safe to re-run any time story text changes.
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
- iOS Safari blocks audio autoplay until a real tap has happened on the page; the first line requires tapping "Ponovi" once, after which line-to-line playback auto-advances.
