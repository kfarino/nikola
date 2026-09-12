#!/usr/bin/env node
// Checks the word-tile quiz builder in index.html.
//
// The quiz used to be "pick the right sentence out of three", where the two
// wrong options were other lines of the same story - about entirely different
// things, so one recognisable keyword answered the question without any
// grammar. Now each question hands you the line's own words, shuffled, plus a
// couple of decoy words from elsewhere in the story, and you rebuild it.
//
// buildQuiz lives inline in index.html, so it is lifted out of the source here
// rather than imported.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const errors = [];
function need(cond, msg) {
  if (!cond) errors.push(msg);
}

function grab(name) {
  // Functions in this file are indented 4 spaces and close on a 4-space "}".
  const re = new RegExp("\\n    function " + name + "\\([\\s\\S]*?\\n    \\}", "");
  const m = html.match(re);
  if (!m) {
    console.error("FAIL: could not find function " + name + "() in index.html");
    process.exit(1);
  }
  return m[0];
}

function constant(name) {
  const m = html.match(new RegExp("const " + name + " = (\\d+);"));
  if (!m) {
    console.error("FAIL: could not find " + name + " in index.html");
    process.exit(1);
  }
  return Number(m[1]);
}

const QUIZ_N = constant("QUIZ_N");
const QUIZ_DECOYS = constant("QUIZ_DECOYS");

const { buildQuiz, lineWords } = new Function(
  "QUIZ_N",
  "QUIZ_DECOYS",
  [grab("shuffle"), grab("lineWords"), grab("buildQuiz")].join("\n") +
    "\nreturn { buildQuiz, lineWords };"
)(QUIZ_N, QUIZ_DECOYS);

// --- lineWords -----------------------------------------------------------
need(
  lineWords("Tara udara loptu prema njemu.").join("|") === "Tara|udara|loptu|prema|njemu",
  "lineWords should drop the trailing period (a tile ending in '.' gives away the last word)"
);
need(lineWords("Hajde!").join("|") === "Hajde", "lineWords should drop a trailing '!'");

// --- buildQuiz over the real stories -------------------------------------
const storiesSrc = fs.readFileSync(path.join(root, "stories.js"), "utf8");
const STORIES = new Function(
  "window",
  storiesSrc + "\nreturn typeof STORIES !== 'undefined' ? STORIES : window.STORIES;"
)({});

need(Array.isArray(STORIES) && STORIES.length > 0, "stories.js should expose STORIES");

for (const story of STORIES || []) {
  const items = buildQuiz(story);
  need(items.length === QUIZ_N, `${story.id}: expected ${QUIZ_N} questions, got ${items.length}`);

  const storyWords = new Set(
    story.lines.flatMap((l) => lineWords(l.hr)).map((w) => w.toLowerCase())
  );

  items.forEach((item, i) => {
    const where = `${story.id} q${i + 1}`;
    const answer = lineWords(item.correct);

    need(!/[.!?]$/.test(item.correct), `${where}: correct answer should carry no end punctuation`);
    need(
      item.tiles.length === answer.length + QUIZ_DECOYS,
      `${where}: expected ${answer.length + QUIZ_DECOYS} tiles, got ${item.tiles.length}`
    );

    const ids = item.tiles.map((t) => t.id);
    need(
      new Set(ids).size === ids.length,
      `${where}: tile ids must be unique, or tapping a repeated word moves the wrong tile`
    );

    // Every answer word is present as a tile, counting duplicates.
    const pool = item.tiles.map((t) => t.text);
    const left = pool.slice();
    let missing = null;
    for (const w of answer) {
      const at = left.indexOf(w);
      if (at === -1) missing = w;
      else left.splice(at, 1);
    }
    need(missing === null, `${where}: answer word "${missing}" has no tile`);
    need(
      left.length === QUIZ_DECOYS,
      `${where}: expected exactly ${QUIZ_DECOYS} decoy tiles left over, got ${left.length}`
    );

    // Decoys must be real words from this story, and must not be words the
    // answer already uses - otherwise a "wrong" tile could complete a correct
    // sentence, or sit there indistinguishable from a right one.
    const answerLower = new Set(answer.map((w) => w.toLowerCase()));
    for (const d of left) {
      need(storyWords.has(d.toLowerCase()), `${where}: decoy "${d}" is not a word from this story`);
      need(!answerLower.has(d.toLowerCase()), `${where}: decoy "${d}" duplicates an answer word`);
    }

    // The point of the format: rebuilding in order reproduces the line exactly.
    need(answer.join(" ") === item.correct, `${where}: answer words should rejoin to the line`);
  });
}

// --- a line that repeats a word ------------------------------------------
// "se" twice is ordinary Croatian; both tiles have to exist independently.
const repeated = {
  id: "s-test",
  lines: [
    { hr: "Tara se penje i se spušta.", en: "Tara climbs and slides." },
    { hr: "Nikola gleda nju cijelo vrijeme.", en: "Nikola watches her the whole time." },
    { hr: "Oni idu skupa prema kući.", en: "They go home together." },
  ],
};
const one = buildQuiz(repeated).find((it) => it.correct.startsWith("Tara se penje"));
if (one) {
  need(
    one.tiles.filter((t) => t.text === "se").length === 2,
    "a line using the same word twice should get two tiles for it"
  );
}

if (errors.length) {
  console.error("FAIL:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log(
  `OK: quiz builds ${QUIZ_N} word-tile questions per story, +${QUIZ_DECOYS} decoys drawn from the same story.`
);
