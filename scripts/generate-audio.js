// One-off script: generates the MP3 narration for every story line via the
// ElevenLabs API, and saves it where stories.js already expects to find it
// (audio/<storyId>/lineNN.mp3). Run this locally whenever story text changes.
//
// Usage:
//   ELEVENLABS_API_KEY=... node scripts/generate-audio.js
//   (or set both in a local .env file — see .env, which is gitignored)
//
// Defaults to "Fran - Calm, Narrative" (voice_id TRnNlYQWHAJwo9K75wNE): a warm, calm,
// medium-to-deep Croatian male voice trained on studio-quality audiobook/documentary
// narration. Override with ELEVENLABS_VOICE_ID to try a different voice from
// https://elevenlabs.io/app/voice-library.

const fs = require("fs");
const path = require("path");
const STORIES = require("../stories.js");

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "TRnNlYQWHAJwo9K75wNE";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

if (!API_KEY) {
  console.error(
    "Missing ELEVENLABS_API_KEY. Set it as an env var or in a local .env file before running.\n" +
      "Example: ELEVENLABS_API_KEY=xxx node scripts/generate-audio.js"
  );
  process.exit(1);
}

async function synthesize(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.6, similarity_boost: 0.8, speed: 0.85 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs API error ${res.status}: ${body}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  for (const story of STORIES) {
    const dir = path.join(__dirname, "..", "audio", story.id);
    fs.mkdirSync(dir, { recursive: true });

    for (let i = 0; i < story.lines.length; i++) {
      const line = story.lines[i];
      const fileName = path.basename(line.audio);
      const outPath = path.join(dir, fileName);

      process.stdout.write(`${story.id}/${fileName}: "${line.hr}" ... `);
      const audioBuffer = await synthesize(line.hr);
      fs.writeFileSync(outPath, audioBuffer);
      console.log("done");
    }
  }
  console.log("\nAll audio generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
