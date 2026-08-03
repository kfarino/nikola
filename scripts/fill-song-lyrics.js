// Fills in songs' blank lyric `lines` from a source you provide - a Google
// Doc link (fetched via its public plain-text export, no Google API
// credentials needed), a local .txt file for one song, or a single local
// .txt file covering several songs at once. You supply the actual lyric
// text yourself; this script only fetches/parses/inserts it, never
// generates or touches the content itself.
//
// Usage (one song):
//   node scripts/fill-song-lyrics.js <songId> <googleDocUrl>
//   node scripts/fill-song-lyrics.js <songId> --file <path>
//
// Usage (several songs in one file):
//   node scripts/fill-song-lyrics.js --multi <path>
//   Expects each song's block separated by a line of 3+ equals signs (===),
//   and each block starting with "id: <songId>" on its own line, followed
//   by that song's lyric lines (one per blank slot, in play order):
//
//     id: some-song-id
//     [lyric line 1]
//     [lyric line 2]
//     ...
//
//     ===
//
//     id: another-song-id
//     [lyric line 1]
//     ...
//
// For the Google Doc mode: the doc must be shared as "Anyone with the
// link" can view (File > Share > General access in Google Docs), since
// this fetches its plain-text export directly with no login.
//
// In every mode, each song's lyric lines skip instrumental-only sections
// (Intro, Solo, etc. - those have no blank slots to fill). The source
// doesn't need to match the song's existing section structure exactly:
// lines fill in order, extra lines get appended to the last section
// instead of being dropped, and if there are fewer lines than blank
// slots, the rest are just left blank.
//
// Run this yourself, locally - it fetches/writes real content, which
// should never pass through a chat session.

const fs = require("fs");
const path = require("path");

function jsStr(s) {
  return JSON.stringify(s);
}

function writeSongsFile(SONGS) {
  const songsSource = SONGS.map((song) => {
    const sections = song.sections
      .map((sec) => {
        const chords = sec.chords.map(jsStr).join(", ");
        const lines = sec.lines.map(jsStr).join(", ");
        return `      { label: ${jsStr(sec.label)}, chords: [${chords}], lines: [${lines}] },`;
      })
      .join("\n");
    return (
      `  {\n` +
      `    id: ${jsStr(song.id)},\n` +
      `    title: ${jsStr(song.title)},\n` +
      `    artist: ${jsStr(song.artist)},\n` +
      `    key: ${jsStr(song.key)},\n` +
      `    capo: ${song.capo === null ? "null" : jsStr(song.capo)},\n` +
      `    sections: [\n${sections}\n    ],\n` +
      `  },`
    );
  }).join("\n");

  const fileContent =
    `const SONGS = [\n${songsSource}\n];\n\n` +
    `// Node (scripts/fill-song-lyrics.js) needs this; browsers ignore it since \`module\` is undefined.\n` +
    `if (typeof module !== "undefined") module.exports = SONGS;\n`;

  fs.writeFileSync(path.join(__dirname, "..", "songs.js"), fileContent);
}

function loadSongs() {
  const booksPath = require.resolve("../songs.js");
  delete require.cache[booksPath];
  return require("../songs.js");
}

function songSlots(song) {
  const slots = [];
  song.sections.forEach((section, si) => {
    section.lines.forEach((_, li) => slots.push([si, li]));
  });
  return slots;
}

// Fills one song's blanks in-memory. Doesn't require an exact line-count
// match against the pre-existing section/chord structure - fills sections
// in order; if the source has fewer lines than blank slots, the remaining
// slots stay blank; if it has more, the leftover lines are appended to the
// last section rather than dropped. This favors "just use what's in the
// file" over exact chord-per-line alignment.
function fillSong(song, docLines) {
  const slots = songSlots(song);
  const shared = Math.min(docLines.length, slots.length);

  for (let i = 0; i < shared; i++) {
    const [si, li] = slots[i];
    song.sections[si].lines[li] = docLines[i];
  }

  const overflow = docLines.slice(shared);
  if (overflow.length > 0) {
    const lastSection = song.sections[song.sections.length - 1];
    lastSection.lines.push(...overflow);
  }

  return { filled: shared, overflow: overflow.length, blankRemaining: slots.length - shared };
}

async function getSingleSourceText(source) {
  if (source === "--file") {
    const filePath = process.argv[4];
    if (!filePath) {
      console.error("Missing file path after --file");
      process.exit(1);
    }
    return fs.readFileSync(filePath, "utf8");
  }

  const match = source.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const docId = match ? match[1] : source;
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  const res = await fetch(exportUrl);
  if (!res.ok) {
    console.error(
      `Could not fetch the doc (HTTP ${res.status}). Make sure it's shared as "Anyone with ` +
        `the link" can view (File > Share in Google Docs), or export it yourself ` +
        `(File > Download > Plain text (.txt)) and run with --file <path> instead.`
    );
    process.exit(1);
  }
  return res.text();
}

async function runSingle(songId, source) {
  const text = await getSingleSourceText(source);
  const docLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const SONGS = loadSongs();
  const song = SONGS.find((s) => s.id === songId);
  if (!song) {
    console.error(`No song with id "${songId}" in songs.js. Known ids: ${SONGS.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  const result = fillSong(song, docLines);

  writeSongsFile(SONGS);
  console.log(`Filled ${result.filled} lines for "${songId}" into songs.js.`);
  if (result.overflow > 0) {
    console.log(`  ${result.overflow} extra line(s) appended to its last section.`);
  }
  if (result.blankRemaining > 0) {
    console.log(`  ${result.blankRemaining} slot(s) left blank (source had fewer lines than the song's structure).`);
  }
}

function runMulti(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const chunks = raw.split(/\n[ \t]*={3,}[ \t]*\n/).map((c) => c.trim()).filter(Boolean);

  if (chunks.length === 0) {
    console.error("No song blocks found - separate each song's block with a line of 3+ equals signs (===).");
    process.exit(1);
  }

  const SONGS = loadSongs();
  const filled = [];

  for (const chunk of chunks) {
    const rawLines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    const first = rawLines[0] || "";
    const idMatch = first.match(/^id:\s*(.+)$/);
    if (!idMatch) {
      console.error(`Each block must start with "id: <songId>" on its own line. Got:\n${first}`);
      process.exit(1);
    }
    const songId = idMatch[1].trim();
    const docLines = rawLines.slice(1);

    const song = SONGS.find((s) => s.id === songId);
    if (!song) {
      console.error(`No song with id "${songId}" in songs.js. Known ids: ${SONGS.map((s) => s.id).join(", ")}`);
      process.exit(1);
    }

    const result = fillSong(song, docLines);
    let note = `${songId} (${result.filled} lines)`;
    if (result.overflow > 0) note += `, +${result.overflow} appended to last section`;
    if (result.blankRemaining > 0) note += `, ${result.blankRemaining} left blank`;
    filled.push(note);
  }

  writeSongsFile(SONGS);
  console.log(`Filled ${filled.length} song(s) into songs.js:\n  ${filled.join("\n  ")}`);
}

async function main() {
  const mode = process.argv[2];

  if (mode === "--multi") {
    const filePath = process.argv[3];
    if (!filePath) {
      console.error("Usage: node scripts/fill-song-lyrics.js --multi <path>");
      process.exit(1);
    }
    runMulti(filePath);
    return;
  }

  const songId = mode;
  const source = process.argv[3];
  if (!songId || !source) {
    console.error(
      "Usage:\n" +
        "  node scripts/fill-song-lyrics.js <songId> <googleDocUrl>\n" +
        "  node scripts/fill-song-lyrics.js <songId> --file <path>\n" +
        "  node scripts/fill-song-lyrics.js --multi <path>"
    );
    process.exit(1);
  }
  await runSingle(songId, source);
}

main();
