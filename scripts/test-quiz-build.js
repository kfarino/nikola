#!/usr/bin/env node
// Checks the quiz builder in index.html.
//
// A quiz is five questions: one typed vocabulary word (the story's focusHr
// from its focusEn), one typed verb form blanked out of a line when the focus
// verb has a findable form, and word-tile questions for the rest - rebuild
// the line from its own shuffled words plus a couple of decoys.
//
// buildQuiz lives inline in index.html, so it is lifted out of the source here
// rather than imported.
const fs = require("fs");
const path = require("path");
const { focusForms, clozeText } = require("../quiz-typing.js");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/\r\n/g, "\n");

const errors = [];
function need(cond, msg) {
  if (!cond) errors.push(msg);
}

function grab(name) {
  // Functions in this file are indented 4 spaces and close on a 4-space "}".
  const m = html.match(new RegExp("\\n    function " + name + "\\([\\s\\S]*?\\n    \\}"));
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
  "focusForms",
  "clozeText",
  [grab("shuffle"), grab("lineWords"), grab("tileItem"), grab("buildQuiz")].join("\n") +
    "\nreturn { buildQuiz, lineWords };"
)(QUIZ_N, QUIZ_DECOYS, focusForms, clozeText);

need(
  lineWords("Tara udara loptu prema njemu.").join("|") === "Tara|udara|loptu|prema|njemu",
  "lineWords should drop the trailing period (a tile ending in '.' gives away the last word)"
);

const STORIES = require("../stories.js");
need(Array.isArray(STORIES) && STORIES.length > 0, "stories.js should expose STORIES");

function checkTiles(item, where, story) {
  const answer = lineWords(item.correct);
  need(!/[.!?]$/.test(item.correct), `${where}: correct answer should carry no end punctuation`);
  need(
    item.tiles.length === answer.length + QUIZ_DECOYS,
    `${where}: expected ${answer.length + QUIZ_DECOYS} tiles, got ${item.tiles.length}`
  );
  const ids = item.tiles.map((t) => t.id);
  need(new Set(ids).size === ids.length, `${where}: tile ids must be unique`);

  const left = item.tiles.map((t) => t.text);
  let missing = null;
  for (const w of answer) {
    const at = left.indexOf(w);
    if (at === -1) missing = w;
    else left.splice(at, 1);
  }
  need(missing === null, `${where}: answer word "${missing}" has no tile`);
  need(left.length === QUIZ_DECOYS, `${where}: expected ${QUIZ_DECOYS} decoys, got ${left.length}`);

  const storyWords = new Set(story.lines.flatMap((l) => lineWords(l.hr)).map((w) => w.toLowerCase()));
  const answerLower = new Set(answer.map((w) => w.toLowerCase()));
  for (const d of left) {
    need(storyWords.has(d.toLowerCase()), `${where}: decoy "${d}" is not a word from this story`);
    need(!answerLower.has(d.toLowerCase()), `${where}: decoy "${d}" duplicates an answer word`);
  }
}

for (const story of STORIES) {
  const items = buildQuiz(story);
  need(items.length === QUIZ_N, `${story.id}: expected ${QUIZ_N} questions, got ${items.length}`);

  const count = (t) => items.filter((i) => i.type === t).length;
  const hasForms = focusForms(story).length > 0;
  need(count("vocab") === (story.focusHr && story.focusEn ? 1 : 0), `${story.id}: one vocab question when focus word exists`);
  need(count("cloze") === (hasForms ? 1 : 0), `${story.id}: one cloze exactly when the focus verb has a form`);
  need(count("tiles") === QUIZ_N - count("vocab") - count("cloze"), `${story.id}: tiles fill the rest`);

  items.forEach((item, i) => {
    const where = `${story.id} q${i + 1} (${item.type})`;
    if (item.type === "tiles") checkTiles(item, where, story);
    if (item.type === "vocab") {
      need(item.correct === story.focusHr && item.en === story.focusEn, `${where}: vocab is the focus word`);
    }
    if (item.type === "cloze") {
      need(item.en.includes("___"), `${where}: cloze prompt has a blank`);
      need(!item.en.includes(item.correct + " ") || item.en.split("___").length === 2, `${where}: exactly one blank`);
      need(item.hint.includes(story.focusHr.split(/\s+/)[0]), `${where}: hint names the infinitive`);
    }
  });
}

// A story with no findable verb form gets no cloze and one more tile question.
const noForms = {
  id: "s-test",
  focusHr: "obitelj",
  focusEn: "family",
  lines: [
    { hr: "Obitelj je velika i sretna.", en: "The family is big and happy." },
    { hr: "Nikola gleda nju cijelo vrijeme.", en: "Nikola watches her the whole time." },
    { hr: "Oni idu skupa prema kući.", en: "They go home together." },
    { hr: "Baka nosi kolač na stol.", en: "Baka carries cake to the table." },
    { hr: "Tata pjeva pjesmu u autu.", en: "Tata sings a song in the car." },
  ],
};
const nf = buildQuiz(noForms);
need(nf.filter((i) => i.type === "cloze").length === 0, "no cloze without a verb form");
need(nf.filter((i) => i.type === "tiles").length === QUIZ_N - 1, "tiles take the cloze's place");

if (errors.length) {
  console.error("FAIL:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log(`OK: every quiz has ${QUIZ_N} questions - vocab, verb cloze when possible, tiles for the rest.`);
