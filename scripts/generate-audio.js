// Generates MP3 narration for story/book lines via the ElevenLabs API.
// Stories save to audio/<storyId>/lineNN.mp3. Books save to
// book-audio/<bookId>/lineNN.mp3. Normal speed only — stories are already
// 5–6 word present-tense chunks, so there are no Polako halves.
//
// Usage:
//   ELEVENLABS_API_KEY=... node scripts/generate-audio.js [options] [id]
//   (or set the key in a local .env file)
//
// Options:
//   --force     overwrite existing MP3s
//   --stories   only stories
//   --books     only books
//
// Optional [id] regenerates just that one story/book.

const fs = require("fs");
const path = require("path");

loadDotEnv();

const STORIES = require("../stories.js");
const BOOKS = require("../books.js");

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "TRnNlYQWHAJwo9K75wNE";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const NORMAL_SPEED = 0.85;

const args = process.argv.slice(2);
const force = args.includes("--force");
const storiesOnly = args.includes("--stories");
const booksOnly = args.includes("--books");
const targetId = args.find((a) => !a.startsWith("--"));

if (!API_KEY) {
  console.error(
    "Missing ELEVENLABS_API_KEY. Set it as an env var, in a local .env file, or as the GitHub Actions secret of the same name.\n" +
      "Example: ELEVENLABS_API_KEY=xxx node scripts/generate-audio.js --stories --force"
  );
  process.exit(1);
}

function loadDotEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

let items;
if (targetId) {
  items = [...STORIES, ...BOOKS].filter((item) => item.id === targetId);
} else if (storiesOnly && !booksOnly) {
  items = [...STORIES, ...(STORIES.PREVIOUS_STORIES || [])];
} else if (booksOnly && !storiesOnly) {
  items = [...BOOKS];
} else {
  items = [...STORIES, ...(STORIES.PREVIOUS_STORIES || []), ...BOOKS];
}

if (targetId && items.length === 0) {
  console.error(
    `No story or book found with id "${targetId}". Check the id in stories.js / books.js.\n` +
      "Example: node scripts/generate-audio.js --stories --force"
  );
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesize(text, speed) {
  for (let attempt = 1; attempt <= 6; attempt++) {
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
        voice_settings: { stability: 0.6, similarity_boost: 0.8, speed },
      }),
    });

    if (res.status === 429 && attempt < 6) {
      const wait = 1000 * attempt * attempt;
      process.stdout.write(`rate-limited, retry in ${wait}ms ... `);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`ElevenLabs API error ${res.status}: ${body}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }
}

async function writeClip(relPath, text) {
  const outPath = path.join(__dirname, "..", relPath);
  if (!force && fs.existsSync(outPath)) {
    process.stdout.write(`${relPath}: exists, skip\n`);
    return;
  }
  process.stdout.write(`${relPath}: "${text}" ... `);
  const audioBuffer = await synthesize(text, NORMAL_SPEED);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, audioBuffer);
  console.log("done");
}

async function main() {
  for (const story of items) {
    if (force && story.lines[0] && story.lines[0].audio) {
      const clipDir = path.join(__dirname, "..", path.dirname(story.lines[0].audio));
      fs.rmSync(clipDir, { recursive: true, force: true });
    }

    for (let i = 0; i < story.lines.length; i++) {
      const line = story.lines[i];
      await writeClip(line.audio, line.hr);
    }
  }
  console.log("\nAll audio generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
