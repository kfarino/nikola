// Converts a plain-text draft into a properly-shaped entry appended to
// books.js. You supply the actual English/Croatian text yourself in
// books/drafts/<id>.txt (gitignored, never committed) - this script only
// handles formatting and insertion, never the text content itself.
//
// Usage:
//   node scripts/add-book.js <id>
//
// Expects books/drafts/<id>.txt in this format (see books/drafts/TEMPLATE.txt):
//
//   id: some-book-id
//   emoji: 📗
//   titleEn: English Title
//   titleHr: Croatian Title
//
//   English line 1
//   Croatian line 1
//
//   English line 2
//   Croatian line 2
//   ...
//
// After running, generate its audio with:
//   node scripts/generate-audio.js <id>

const fs = require("fs");
const path = require("path");

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/add-book.js <id>\nExpects books/drafts/<id>.txt to exist (see books/drafts/TEMPLATE.txt).");
  process.exit(1);
}

const draftPath = path.join(__dirname, "..", "books", "drafts", `${id}.txt`);
if (!fs.existsSync(draftPath)) {
  console.error(`Missing draft file: ${draftPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(draftPath, "utf8").replace(/\r\n/g, "\n");
const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

if (blocks.length < 2) {
  console.error("Draft needs a metadata header block, then at least one English/Croatian line pair, separated by a blank line.");
  process.exit(1);
}

const meta = {};
for (const line of blocks[0].split("\n")) {
  const idx = line.indexOf(":");
  if (idx === -1) continue;
  meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}

const required = ["id", "emoji", "titleEn", "titleHr"];
for (const key of required) {
  if (!meta[key]) {
    console.error(`Missing "${key}:" in the draft's metadata header.`);
    process.exit(1);
  }
}

const lines = [];
for (const block of blocks.slice(1)) {
  const parts = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (parts.length !== 2) {
    console.error(`Expected exactly 2 lines (English, then Croatian) in this block, got ${parts.length}:\n${block}`);
    process.exit(1);
  }
  const [en, hr] = parts;
  lines.push({ hr, en });
}

const entrySource =
  `  {\n` +
  `    id: ${JSON.stringify(meta.id)},\n` +
  `    emoji: ${JSON.stringify(meta.emoji)},\n` +
  `    titleHr: ${JSON.stringify(meta.titleHr)},\n` +
  `    titleEn: ${JSON.stringify(meta.titleEn)},\n` +
  `    lines: [\n` +
  lines.map((l) => `      { hr: ${JSON.stringify(l.hr)}, en: ${JSON.stringify(l.en)} },\n`).join("") +
  `    ],\n` +
  `  },\n`;

const booksPath = path.join(__dirname, "..", "books.js");
const booksSource = fs.readFileSync(booksPath, "utf8");

const arrayStart = booksSource.indexOf("const BOOKS = [");
const arrayEnd = booksSource.indexOf("\n];", arrayStart);
if (arrayStart === -1 || arrayEnd === -1) {
  console.error("Could not find the BOOKS array in books.js - insert the entry manually.");
  process.exit(1);
}

const updated = booksSource.slice(0, arrayEnd) + entrySource.replace(/\n$/, "") + booksSource.slice(arrayEnd);
fs.writeFileSync(booksPath, updated);

console.log(`Added "${meta.id}" (${lines.length} lines) to books.js.`);
console.log(`Next: node scripts/generate-audio.js ${meta.id}`);
