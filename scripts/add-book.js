// Converts a plain-text draft into properly-shaped entries appended to
// books.js. You supply the actual English/Croatian text yourself in
// books/drafts/ (gitignored, never committed) - this script only handles
// formatting and insertion, never the text content itself.
//
// Usage (one book per file):
//   node scripts/add-book.js <id>
//   Expects books/drafts/<id>.txt
//
// Usage (several books in one file):
//   node scripts/add-book.js --multi <path>
//   Expects each book's block separated by a line of 3+ equals signs (===)
//
// Each book's block (see books/drafts/TEMPLATE.txt) looks like:
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
// After running, generate audio for a book with:
//   node scripts/generate-audio.js <id>

const fs = require("fs");
const path = require("path");

function parseBookBlock(text) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length < 2) {
    throw new Error("Needs a metadata header block, then at least one English/Croatian line pair, separated by a blank line.");
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
      throw new Error(`Missing "${key}:" in the block's metadata header.`);
    }
  }

  const lines = [];
  for (const block of blocks.slice(1)) {
    const parts = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (parts.length !== 2) {
      throw new Error(`Expected exactly 2 lines (English, then Croatian) in this block, got ${parts.length}:\n${block}`);
    }
    const [en, hr] = parts;
    lines.push({ hr, en });
  }

  return { meta, lines };
}

function entrySource(meta, lines) {
  return (
    `  {\n` +
    `    id: ${JSON.stringify(meta.id)},\n` +
    `    emoji: ${JSON.stringify(meta.emoji)},\n` +
    `    titleHr: ${JSON.stringify(meta.titleHr)},\n` +
    `    titleEn: ${JSON.stringify(meta.titleEn)},\n` +
    `    lines: [\n` +
    lines.map((l) => `      { hr: ${JSON.stringify(l.hr)}, en: ${JSON.stringify(l.en)} },\n`).join("") +
    `    ],\n` +
    `  },\n`
  );
}

function appendEntries(entriesSource) {
  const booksPath = path.join(__dirname, "..", "books.js");
  const booksSource = fs.readFileSync(booksPath, "utf8");

  const arrayStart = booksSource.indexOf("const BOOKS = [");
  const arrayEnd = booksSource.indexOf("\n];", arrayStart);
  if (arrayStart === -1 || arrayEnd === -1) {
    console.error("Could not find the BOOKS array in books.js - insert the entry/entries manually.");
    process.exit(1);
  }

  const updated = booksSource.slice(0, arrayEnd) + entriesSource + booksSource.slice(arrayEnd);
  fs.writeFileSync(booksPath, updated);
}

function main() {
  const mode = process.argv[2];

  if (mode === "--multi") {
    const filePath = process.argv[3];
    if (!filePath) {
      console.error("Usage: node scripts/add-book.js --multi <path>");
      process.exit(1);
    }
    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
    const chunks = raw.split(/\n[ \t]*={3,}[ \t]*\n/).map((c) => c.trim()).filter(Boolean);

    if (chunks.length === 0) {
      console.error("No book blocks found - separate each book's block with a line of 3+ equals signs (===).");
      process.exit(1);
    }

    let entriesSource = "";
    const added = [];
    chunks.forEach((chunk, i) => {
      let parsed;
      try {
        parsed = parseBookBlock(chunk);
      } catch (err) {
        console.error(`Block ${i + 1}: ${err.message}`);
        process.exit(1);
      }
      entriesSource += entrySource(parsed.meta, parsed.lines);
      added.push(`${parsed.meta.id} (${parsed.lines.length} lines)`);
    });

    appendEntries(entriesSource.replace(/\n$/, ""));
    console.log(`Added ${added.length} book(s) to books.js:\n  ${added.join("\n  ")}`);
    console.log(`Next, for each: node scripts/generate-audio.js <id>`);
    return;
  }

  const id = mode;
  if (!id) {
    console.error(
      "Usage:\n" +
        "  node scripts/add-book.js <id>              (reads books/drafts/<id>.txt)\n" +
        "  node scripts/add-book.js --multi <path>    (reads several books from one file, separated by ===)"
    );
    process.exit(1);
  }

  const draftPath = path.join(__dirname, "..", "books", "drafts", `${id}.txt`);
  if (!fs.existsSync(draftPath)) {
    console.error(`Missing draft file: ${draftPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(draftPath, "utf8").replace(/\r\n/g, "\n");
  let parsed;
  try {
    parsed = parseBookBlock(raw);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  appendEntries(entrySource(parsed.meta, parsed.lines).replace(/\n$/, ""));
  console.log(`Added "${parsed.meta.id}" (${parsed.lines.length} lines) to books.js.`);
  console.log(`Next: node scripts/generate-audio.js ${parsed.meta.id}`);
}

main();
