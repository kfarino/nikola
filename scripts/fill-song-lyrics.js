// Fills in a song's blank lyric `lines` from a source you provide - a
// Google Doc link (fetched via its public plain-text export, no Google API
// credentials needed) or a local .txt file - one line of the source per
// blank slot, in order across the song's sections. You supply the actual
// lyric text yourself; this script only fetches/parses/inserts it, never
// generates or touches the content itself.
//
// Usage:
//   node scripts/fill-song-lyrics.js <songId> <googleDocUrl>
//   node scripts/fill-song-lyrics.js <songId> --file <path>
//
// For the Google Doc mode: the doc must be shared as "Anyone with the
// link" can view (File > Share > General access in Google Docs), since
// this fetches its plain-text export directly with no login. The doc
// should contain exactly one lyric line per line of text, in the same
// order as the song plays, skipping instrumental-only sections (Intro,
// Solo, etc. - those have no blank slots to fill).
//
// Run this yourself, locally - it fetches/writes real content, which
// should never pass through a chat session.

const fs = require("fs");
const path = require("path");

const songId = process.argv[2];
const source = process.argv[3];

if (!songId || !source) {
  console.error(
    "Usage:\n" +
      "  node scripts/fill-song-lyrics.js <songId> <googleDocUrl>\n" +
      "  node scripts/fill-song-lyrics.js <songId> --file <path>"
  );
  process.exit(1);
}

async function getText() {
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

async function main() {
  const text = await getText();
  const docLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  delete require.cache[require.resolve("../songs.js")];
  const SONGS = require("../songs.js");
  const song = SONGS.find((s) => s.id === songId);
  if (!song) {
    console.error(`No song with id "${songId}" in songs.js. Known ids: ${SONGS.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  const slots = [];
  song.sections.forEach((section, si) => {
    section.lines.forEach((_, li) => slots.push([si, li]));
  });

  if (docLines.length !== slots.length) {
    console.error(
      `Line count mismatch: "${songId}" has ${slots.length} blank lyric slots across its sections, ` +
        `but the source has ${docLines.length} non-empty lines. Fix the source (or the song's section/line ` +
        `structure in songs.js) so the counts match, then try again. Nothing was written.`
    );
    process.exit(1);
  }

  slots.forEach(([si, li], i) => {
    song.sections[si].lines[li] = docLines[i];
  });

  writeSongsFile(SONGS);
  console.log(`Filled ${slots.length} lines for "${songId}" into songs.js.`);
}

main();
