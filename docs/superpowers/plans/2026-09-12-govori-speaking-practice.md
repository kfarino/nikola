# Govori (Speaking-First Practice) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an eyes-free, Pimsleur-style speaking mode where an English voice prompts, the learner answers aloud from memory, a Croatian voice confirms, and self-rating drives graduated interval recall.

**Architecture:** Story lines are sliced into word/chunk/line **items** (Croatian never invented — only selected), glossed from Wiktionary with anything unverifiable diverted to a review file. A pure scheduler module holds the interval ladder and intake brake. The Govori tab plays generated English-prompt and Croatian-answer clips against that scheduler. Priče's weekly rotation and `nikola-learn` are untouched.

**Tech Stack:** Plain HTML/CSS/JS, no build step. Node 18+ (built-in `fetch`), CommonJS scripts. ElevenLabs for audio (offline, committed). Wiktionary REST API for glosses. `localStorage` for state.

**Spec:** `docs/superpowers/specs/2026-09-12-govori-speaking-practice-design.md`

## Global Constraints

- **No build step.** Browser files are plain `<script>` includes. Follow `learn-gate.js`: plain script plus a `if (typeof module !== "undefined")` export guard for tests.
- **Tests are plain Node scripts** in `scripts/`, named `test-*.js`, using the existing `const errors = []; function need(cond, msg)` pattern from `scripts/test-quiz-gate.js`. Exit 1 on failure with a `FAIL:` block.
- **`index.html` is CRLF.** Patch it with a script that normalises to LF, edits, and writes CRLF back — an exact-string match against CRLF content silently fails otherwise.
- **Never generate, transcribe, or translate book or song text.** This plan touches stories only.
- **Croatian is never invented.** Every item's `hr` must be a verbatim contiguous substring of its source line. Enforced by test, not convention.
- **The app never calls a network API at runtime.** Audio and glosses are generated offline and committed.
- **Do not touch** `nikola-learn`, `learn-gate.js`, `update-weekly-stories.js`'s rotation logic, or `audio/<storyId>/<week>/`.
- Commit messages: sentence-case summary describing behaviour, and end with the attribution lines used in this repo's recent commits.

---

### Task 1: Stable variant ids

`scripts/story-bank.js` variants are addressed positionally, and the two shapes differ: `bank.tara.variants` is an array, `bank.sada.variants` is an object keyed by name. Items and their audio are keyed by variant, so every variant needs a stable id that survives reordering.

**Files:**
- Create: `scripts/variant-ids.js`
- Create: `scripts/test-variant-ids.js`

**Interfaces:**
- Produces: `variantId(slotKey, arrayIndexOrObjectKey) -> string`, `eachVariant(bank) -> [{ slotKey, key, variantId, variant }]`

- [ ] **Step 1: Write the failing test**

```js
#!/usr/bin/env node
const { variantId, eachVariant } = require("./variant-ids.js");
const bank = require("./story-bank.js");

const errors = [];
function need(cond, msg) { if (!cond) errors.push(msg); }

need(variantId("tara", 0) === "tara-0", "array variants are slot-index");
need(variantId("sada", "mamaBirthday") === "sada-mamaBirthday", "object variants are slot-key");

const all = eachVariant(bank);
need(all.length === 13, `expected 13 variants, got ${all.length}`);

const ids = all.map((v) => v.variantId);
need(new Set(ids).size === ids.length, "variant ids must be unique");
need(all.every((v) => v.variant && Array.isArray(v.variant.lines)), "every entry carries its variant");
need(ids.includes("sada-mamaBirthday"), "object-shaped slot is enumerated");
need(ids.includes("tara-0"), "array-shaped slot is enumerated");

if (errors.length) { console.error("FAIL:"); errors.forEach((e) => console.error("  - " + e)); process.exit(1); }
console.log(`OK: ${all.length} variants have stable unique ids.`);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-variant-ids.js`
Expected: FAIL — `Cannot find module './variant-ids.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// Stable per-variant identity. story-bank.js stores variants two ways:
// most slots use an array (picked by weekNum % length), while `sada` uses an
// object keyed by occasion. Items and their audio are keyed by variant, so
// both shapes need one id scheme that survives reordering.
function variantId(slotKey, key) {
  return `${slotKey}-${key}`;
}

function eachVariant(bank) {
  const out = [];
  for (const slotKey of Object.keys(bank)) {
    const variants = bank[slotKey].variants;
    const entries = Array.isArray(variants)
      ? variants.map((v, i) => [i, v])
      : Object.entries(variants);
    for (const [key, variant] of entries) {
      out.push({ slotKey, key, variantId: variantId(slotKey, key), variant });
    }
  }
  return out;
}

if (typeof module !== "undefined") module.exports = { variantId, eachVariant };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-variant-ids.js`
Expected: PASS — `OK: 13 variants have stable unique ids.`

- [ ] **Step 5: Commit**

```bash
git add scripts/variant-ids.js scripts/test-variant-ids.js
git commit -m "Give every story variant a stable id."
```

---

### Task 2: Slice lines into item candidates

Produces word and chunk candidates with no glosses yet. This is the step that guarantees Croatian is never invented.

**Files:**
- Create: `scripts/slice-items.js`
- Create: `scripts/test-slice-items.js`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `sliceLine(hr) -> [{ id, kind, hr }]` where `kind` is `"word"` or `"chunk"`; ids are `w-<slug>` / `c-<slug>`.

Rules: words are content words of 3+ characters that are not in a small
function-word stoplist; chunks are every contiguous 2-word and 3-word span
that contains at least one selected word. Cap at 2 words and 2 chunks per
line, preferring the longest words and the spans around them, so a 10-line
story yields ~40 items rather than hundreds.

- [ ] **Step 1: Write the failing test**

```js
#!/usr/bin/env node
const { sliceLine } = require("./slice-items.js");

const errors = [];
function need(cond, msg) { if (!cond) errors.push(msg); }

const LINE = "Tara udara loptu prema njemu.";
const items = sliceLine(LINE);

need(items.length > 0, "a line yields at least one item");
need(items.length <= 4, `at most 4 items per line, got ${items.length}`);

// The load-bearing rule: nothing is invented.
const bare = LINE.replace(/[.!?]+$/, "");
for (const it of items) {
  need(bare.includes(it.hr), `"${it.hr}" is not a verbatim span of the line`);
}

need(items.some((i) => i.kind === "word"), "produces at least one word item");
need(items.some((i) => i.kind === "chunk"), "produces at least one chunk item");
need(items.every((i) => /^[wc]-/.test(i.id)), "ids are prefixed by kind");
need(new Set(items.map((i) => i.id)).size === items.length, "ids are unique within a line");

// Function words are not drilled in isolation - their meaning is positional.
need(!items.some((i) => i.kind === "word" && i.hr === "prema"), "stoplisted words are not word items");

const chunks = items.filter((i) => i.kind === "chunk");
need(chunks.every((c) => c.hr.split(" ").length >= 2), "chunks are multi-word");

if (errors.length) { console.error("FAIL:"); errors.forEach((e) => console.error("  - " + e)); process.exit(1); }
console.log(`OK: sliced "${LINE}" into ${items.length} verbatim items.`);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-slice-items.js`
Expected: FAIL — `Cannot find module './slice-items.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// Cuts a line into drillable pieces. Every piece is a verbatim contiguous
// span of the line - this module selects Croatian, it never produces any, so
// it cannot introduce a wrong case or a wrong verb form.
const STOPLIST = new Set([
  "i", "u", "na", "za", "se", "su", "je", "mu", "joj", "ga", "nju", "njemu",
  "njom", "prema", "još", "sad", "tu", "tamo", "od", "do", "s", "sa", "li",
  "a", "ali", "pa", "te", "ne", "kao", "po", "iz", "o",
]);

const MAX_WORDS = 2;
const MAX_CHUNKS = 2;

function slug(text) {
  return text
    .toLowerCase()
    .replace(/č|ć/g, "c").replace(/ž/g, "z").replace(/š/g, "s").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function bareWords(hr) {
  return hr.replace(/[.!?]+$/, "").split(/\s+/).filter(Boolean);
}

function sliceLine(hr) {
  const words = bareWords(hr);
  const content = words
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => w.length >= 3 && !STOPLIST.has(w.toLowerCase()));

  // Longest first: the meatiest words are the ones worth owning.
  const picked = content.slice().sort((a, b) => b.w.length - a.w.length).slice(0, MAX_WORDS);

  const items = picked.map(({ w }) => ({ id: `w-${slug(w)}`, kind: "word", hr: w }));

  const chunks = [];
  for (const { i } of picked) {
    for (const span of [2, 3]) {
      for (let start = Math.max(0, i - span + 1); start + span <= words.length && start <= i; start++) {
        const text = words.slice(start, start + span).join(" ");
        const id = `c-${slug(text)}`;
        if (!chunks.some((c) => c.id === id)) chunks.push({ id, kind: "chunk", hr: text });
      }
    }
  }

  const seen = new Set(items.map((i) => i.id));
  for (const c of chunks) {
    if (items.length >= MAX_WORDS + MAX_CHUNKS) break;
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    items.push(c);
  }

  return items;
}

if (typeof module !== "undefined") module.exports = { sliceLine, slug, bareWords, STOPLIST };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-slice-items.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/slice-items.js scripts/test-slice-items.js
git commit -m "Slice story lines into verbatim word and chunk candidates."
```

---

### Task 3: Wiktionary lookup with a disk cache

**Files:**
- Create: `scripts/wiktionary.js`
- Create: `scripts/test-wiktionary.js`
- Create: `scripts/.cache/` (gitignored)
- Modify: `.gitignore`

**Interfaces:**
- Produces: `async lookup(word, { fetchImpl, cacheDir }) -> { word, lemma, senses: string[] } | null`

- [ ] **Step 1: Probe the real API shape before coding against it**

Do not skip this. Run it and read the output — the plan does not assume a response shape.

```bash
curl -s "https://en.wiktionary.org/api/rest_v1/page/definition/lopta" | head -c 2000
```

Note which language key holds Serbo-Croatian (expect `sh`), and where the
English sense text lives inside it. If the endpoint 404s for inflected forms
like `loptu`, that is expected — record it, because Step 3's `null` return
and Task 4's needs-review routing depend on it.

- [ ] **Step 2: Write the failing test**

Network is mocked so the test is offline and deterministic.

```js
#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { lookup } = require("./wiktionary.js");

const errors = [];
function need(cond, msg) { if (!cond) errors.push(msg); }

const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "wikt-"));

let calls = 0;
const fetchImpl = async () => {
  calls += 1;
  return {
    ok: true,
    json: async () => ({
      sh: [{ definitions: [{ definition: "<b>ball</b>" }, { definition: "sphere" }] }],
      en: [{ definitions: [{ definition: "not this one" }] }],
    }),
  };
};

(async () => {
  const first = await lookup("lopta", { fetchImpl, cacheDir });
  need(first !== null, "a known word resolves");
  need(first.senses.includes("ball"), `senses should include "ball", got ${JSON.stringify(first?.senses)}`);
  need(!first.senses.some((s) => s.includes("<")), "HTML is stripped from senses");
  need(!first.senses.includes("not this one"), "only Serbo-Croatian senses are used");

  await lookup("lopta", { fetchImpl, cacheDir });
  need(calls === 1, `second lookup must hit the cache, saw ${calls} fetches`);

  const missing = await lookup("qqqq", { fetchImpl: async () => ({ ok: false, status: 404 }), cacheDir });
  need(missing === null, "a 404 resolves to null, not a throw");

  const missAgain = await lookup("qqqq", {
    fetchImpl: async () => { throw new Error("should not refetch a cached miss"); },
    cacheDir,
  });
  need(missAgain === null, "misses are cached too");

  if (errors.length) { console.error("FAIL:"); errors.forEach((e) => console.error("  - " + e)); process.exit(1); }
  console.log("OK: wiktionary lookup caches hits and misses, keeps only Serbo-Croatian senses.");
})();
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node scripts/test-wiktionary.js`
Expected: FAIL — `Cannot find module './wiktionary.js'`

- [ ] **Step 4: Write minimal implementation**

Adjust the `sh` key and definition path if Step 1's probe showed something different.

```js
// Wiktionary definitions for Croatian surface forms, cached to disk so the
// gloss pass is offline and repeatable after its first run. Serbo-Croatian
// entries ("sh") carry the Croatian senses.
const fs = require("fs");
const path = require("path");

const API = "https://en.wiktionary.org/api/rest_v1/page/definition/";

function cachePath(cacheDir, word) {
  return path.join(cacheDir, encodeURIComponent(word.toLowerCase()) + ".json");
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function lookup(word, { fetchImpl = fetch, cacheDir } = {}) {
  const file = cachePath(cacheDir, word);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  let result = null;
  const res = await fetchImpl(API + encodeURIComponent(word));
  if (res.ok) {
    const body = await res.json();
    const sh = body.sh || [];
    const senses = sh
      .flatMap((entry) => entry.definitions || [])
      .map((d) => stripHtml(d.definition || ""))
      .filter(Boolean);
    if (senses.length) result = { word, lemma: word, senses };
  }

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(result));
  return result;
}

if (typeof module !== "undefined") module.exports = { lookup, stripHtml };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node scripts/test-wiktionary.js`
Expected: PASS

- [ ] **Step 6: Ignore the cache**

```bash
printf 'scripts/.cache/\n' >> .gitignore
```

- [ ] **Step 7: Commit**

```bash
git add scripts/wiktionary.js scripts/test-wiktionary.js .gitignore
git commit -m "Look up Croatian senses on Wiktionary, cached to disk."
```

---

### Task 4: Calibration run — measure the gloss rate before committing to the bank

**This task's deliverable is a number, not a feature.** Automatic glossing of inflected Croatian is the one genuinely uncertain part of this plan. Measure it on a sample before building the full pipeline on top of it. If the verify rate is poor, stop and report — the design may need hand-glossing, which is a decision for Kevin, not something to work around silently.

**Files:**
- Create: `scripts/calibrate-glosses.js` (throwaway; deleted in Task 5)

**Interfaces:**
- Consumes: `sliceLine` (Task 2), `lookup` (Task 3), `eachVariant` (Task 1).

- [ ] **Step 1: Write the calibration script**

```js
#!/usr/bin/env node
// Throwaway. Answers one question: what fraction of sliced items can be
// glossed automatically? Delete once the answer is recorded.
const bank = require("./story-bank.js");
const { eachVariant } = require("./variant-ids.js");
const { sliceLine } = require("./slice-items.js");
const { lookup } = require("./wiktionary.js");
const path = require("path");

const cacheDir = path.join(__dirname, ".cache");
const SAMPLE_LINES = 20;

(async () => {
  const lines = eachVariant(bank).flatMap((v) => v.variant.lines).slice(0, SAMPLE_LINES);
  let words = 0, wordsResolved = 0, chunks = 0, chunksResolved = 0;
  const unresolved = [];

  for (const line of lines) {
    for (const item of sliceLine(line.hr)) {
      const parts = item.hr.split(" ");
      const hits = [];
      for (const p of parts) hits.push(await lookup(p.toLowerCase(), { cacheDir }));
      const ok = hits.every(Boolean);
      if (item.kind === "word") { words++; if (ok) wordsResolved++; else unresolved.push(item.hr); }
      else { chunks++; if (ok) chunksResolved++; else unresolved.push(item.hr); }
    }
  }

  console.log(`words:  ${wordsResolved}/${words}`);
  console.log(`chunks: ${chunksResolved}/${chunks}`);
  console.log(`unresolved sample: ${unresolved.slice(0, 25).join(", ")}`);
})();
```

- [ ] **Step 2: Run it and record the result**

Run: `node scripts/calibrate-glosses.js`

Write the two ratios into the plan file under this step before continuing.

- [ ] **Step 3: Decide, and say so out loud**

- **Words resolve ≥ 70%** → continue to Task 5 as written.
- **Words resolve < 70%** → **stop and report to Kevin.** Inflected forms are not resolving, and the options (a lemmatiser, a Croatian wordlist, or hand-glossing ~100 words once) are his call. Do not silently pick one.
- **Chunks resolve much worse than words** (expected) → continue; Task 5 composes chunk glosses from the line's English rather than from the dictionary, and routes failures to review.

- [ ] **Step 4: Commit nothing**

This task produces a decision, not code. `scripts/calibrate-glosses.js` stays uncommitted and is deleted in Task 5.

---

### Task 5: Build the item file

**Files:**
- Create: `scripts/build-story-items.js`
- Create: `story-items.js` (generated)
- Create: `scripts/story-items-needs-review.json` (generated)
- Create: `scripts/test-items.js`
- Delete: `scripts/calibrate-glosses.js`

**Interfaces:**
- Consumes: `eachVariant` (Task 1), `sliceLine` (Task 2), `lookup` (Task 3).
- Produces: global `STORY_ITEMS` — `{ [variantId]: [{ lineIndex, id, kind, hr, en }] }`. The full line is **not** listed; it is derived at read time with the implicit id `line`.

Word glosses come from the dictionary's first sense. Chunk glosses are a
contiguous span of the line's own English, accepted only when every Croatian
word in the chunk resolves and at least one of its senses appears in that
span. Anything else goes to `story-items-needs-review.json` and is excluded
from `story-items.js`; nothing unverified reaches the learner.

- [ ] **Step 1: Write the failing test**

```js
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const bank = require("./story-bank.js");
const { eachVariant } = require("./variant-ids.js");

const errors = [];
function need(cond, msg) { if (!cond) errors.push(msg); }

const file = path.join(__dirname, "..", "story-items.js");
need(fs.existsSync(file), "story-items.js must be generated (run scripts/build-story-items.js)");
if (!fs.existsSync(file)) { console.error("FAIL:"); errors.forEach(e=>console.error("  - "+e)); process.exit(1); }

const STORY_ITEMS = new Function(fs.readFileSync(file, "utf8") + "\nreturn STORY_ITEMS;")();
const variants = eachVariant(bank);

need(Object.keys(STORY_ITEMS).length > 0, "item file is not empty");

for (const { variantId, variant } of variants) {
  const items = STORY_ITEMS[variantId] || [];
  for (const it of items) {
    const line = variant.lines[it.lineIndex];
    need(!!line, `${variantId}: lineIndex ${it.lineIndex} is out of range`);
    if (!line) continue;
    const bare = line.hr.replace(/[.!?]+$/, "");
    need(bare.includes(it.hr), `${variantId}: "${it.hr}" is not a verbatim span of its line`);
    need(typeof it.en === "string" && it.en.length > 0, `${variantId}: "${it.hr}" has no gloss`);
    need(it.kind === "word" || it.kind === "chunk", `${variantId}: bad kind ${it.kind}`);
  }
  const ids = items.map((i) => `${i.lineIndex}:${i.id}`);
  need(new Set(ids).size === ids.length, `${variantId}: item ids must be unique per line`);
  need(!items.some((i) => i.id === "line"), `${variantId}: "line" is reserved for the derived full-line item`);
}

if (errors.length) { console.error("FAIL:"); errors.forEach((e) => console.error("  - " + e)); process.exit(1); }
const total = Object.values(STORY_ITEMS).reduce((n, a) => n + a.length, 0);
console.log(`OK: ${total} items across ${Object.keys(STORY_ITEMS).length} variants, all verbatim and glossed.`);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-items.js`
Expected: FAIL — `story-items.js must be generated`

- [ ] **Step 3: Write the builder**

```js
#!/usr/bin/env node
// Regenerates story-items.js from the bank. Never hand-edit story-items.js.
// Croatian is sliced verbatim; only the English gloss is produced here, and
// only when the dictionary backs it. Everything else lands in
// story-items-needs-review.json and is left out of the shipped file.
const fs = require("fs");
const path = require("path");
const bank = require("./story-bank.js");
const { eachVariant } = require("./variant-ids.js");
const { sliceLine } = require("./slice-items.js");
const { lookup } = require("./wiktionary.js");

const cacheDir = path.join(__dirname, ".cache");

function enSpans(en) {
  const w = en.replace(/[.!?]+$/, "").split(/\s+/);
  const out = [];
  for (let n = 1; n <= 4; n++) {
    for (let i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n).join(" "));
  }
  return out;
}

async function glossFor(item, line) {
  const parts = item.hr.split(" ").map((p) => p.toLowerCase());
  const hits = [];
  for (const p of parts) hits.push(await lookup(p, { cacheDir }));
  if (hits.some((h) => !h)) return { ok: false, reason: "no dictionary entry" };

  if (item.kind === "word") {
    return { ok: true, en: hits[0].senses[0] };
  }

  const senses = hits.flatMap((h) => h.senses.map((s) => s.toLowerCase()));
  const span = enSpans(line.en).find(
    (s) => s.split(/\s+/).length >= 2 && senses.some((sense) => s.toLowerCase().includes(sense.split(/[;,]/)[0].trim()))
  );
  if (!span) return { ok: false, reason: "no English span matches the dictionary senses" };
  return { ok: true, en: span };
}

(async () => {
  const items = {};
  const review = [];

  for (const { variantId, variant } of eachVariant(bank)) {
    items[variantId] = [];
    variant.lines.forEach((line, lineIndex) => {
      variant.lines[lineIndex]._i = lineIndex;
    });
    for (let lineIndex = 0; lineIndex < variant.lines.length; lineIndex++) {
      const line = variant.lines[lineIndex];
      for (const cand of sliceLine(line.hr)) {
        const g = await glossFor(cand, line);
        if (g.ok) items[variantId].push({ lineIndex, id: cand.id, kind: cand.kind, hr: cand.hr, en: g.en });
        else review.push({ variantId, lineIndex, hr: cand.hr, kind: cand.kind, line: line.hr, reason: g.reason });
      }
    }
  }

  const out =
    "// Generated by scripts/build-story-items.js - do not hand-edit.\n" +
    "const STORY_ITEMS = " + JSON.stringify(items, null, 2) + ";\n" +
    'if (typeof module !== "undefined") module.exports = STORY_ITEMS;\n';
  fs.writeFileSync(path.join(__dirname, "..", "story-items.js"), out);
  fs.writeFileSync(path.join(__dirname, "story-items-needs-review.json"), JSON.stringify(review, null, 2));

  const total = Object.values(items).reduce((n, a) => n + a.length, 0);
  console.log(`wrote ${total} items; ${review.length} need review`);
})();
```

- [ ] **Step 4: Generate and inspect**

```bash
node scripts/build-story-items.js
head -40 scripts/story-items-needs-review.json
```

Read the review file. If it is more than about a third of all candidates,
stop and report the ratio rather than shipping a thin item set.

- [ ] **Step 5: Run test to verify it passes**

Run: `node scripts/test-items.js`
Expected: PASS

- [ ] **Step 6: Wire into the page and clean up**

Add `<script src="story-items.js"></script>` to `index.html` immediately after the existing `<script src="stories.js"></script>` line, using the CRLF-safe patch approach from Global Constraints.

```bash
rm scripts/calibrate-glosses.js
```

- [ ] **Step 7: Commit**

```bash
git add scripts/build-story-items.js scripts/test-items.js story-items.js scripts/story-items-needs-review.json index.html
git commit -m "Generate drillable word and chunk items from the story bank."
```

---

### Task 6: The scheduler — interval ladder and ratings

**Files:**
- Create: `practice-scheduler.js` (repo root, beside `learn-gate.js`)
- Create: `scripts/test-scheduler.js`

**Interfaces:**
- Produces: `LADDER`, `rate(record, rating, now) -> record`, `isDue(record, now) -> boolean`, `dueItems(store, allKeys, now) -> string[]`. A record is `{ step, dueAt, lapses, introducedOn }`. Ratings are `"znam" | "skoro" | "neznam"`.

- [ ] **Step 1: Write the failing test**

```js
#!/usr/bin/env node
const { LADDER, rate, isDue, newRecord } = require("../practice-scheduler.js");

const errors = [];
function need(cond, msg) { if (!cond) errors.push(msg); }

const T0 = 1_760_000_000_000;
const MIN = 60_000, DAY = 86_400_000;

need(LADDER[0] === 1 * MIN, "ladder starts at 1m");
need(LADDER[2] === 1 * DAY, "third step is 1 day");
need(LADDER[LADDER.length - 1] === 60 * DAY, "ladder ends at 60 days");

let r = newRecord(T0);
need(r.step === 0 && r.lapses === 0, "a new record starts at step 0");

r = rate(r, "znam", T0);
need(r.step === 1, "znam advances a step");
need(r.dueAt === T0 + LADDER[1], "znam schedules by the new step");

const held = rate({ step: 3, dueAt: 0, lapses: 0 }, "skoro", T0);
need(held.step === 3, "skoro holds the step");
need(held.dueAt === T0 + 10 * MIN, "skoro re-dues in 10 minutes");

const missed = rate({ step: 4, dueAt: 0, lapses: 0 }, "neznam", T0);
need(missed.step === 0, "neznam resets to step 0");
need(missed.dueAt === T0 + 1 * MIN, "neznam re-dues within the session");
need(missed.lapses === 1, "neznam counts a lapse");

// Leech: after 4 lapses a miss re-enters at 10m, so one stubborn word
// cannot dominate a session.
const leech = rate({ step: 2, dueAt: 0, lapses: 4 }, "neznam", T0);
need(leech.dueAt === T0 + 10 * MIN, "a leech re-enters at 10m, not 1m");
need(leech.lapses === 5, "lapses keep counting");

// The ladder must not run off its end.
const top = rate({ step: LADDER.length - 1, dueAt: 0, lapses: 0 }, "znam", T0);
need(top.step === LADDER.length - 1, "znam at the top step stays at the top");

need(isDue({ dueAt: T0 - 1 }, T0) === true, "past due is due");
need(isDue({ dueAt: T0 + 1 }, T0) === false, "future is not due");

if (errors.length) { console.error("FAIL:"); errors.forEach((e) => console.error("  - " + e)); process.exit(1); }
console.log("OK: interval ladder, three ratings, leech damping.");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-scheduler.js`
Expected: FAIL — `Cannot find module '../practice-scheduler.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// Graduated interval recall, the Pimsleur mechanic: an item you get right
// comes back later and later; one you miss comes back immediately. Pure -
// no DOM, no storage, no clock of its own - so the whole schedule is
// testable headlessly. Shared by the app and scripts/test-scheduler.js.
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

const LADDER = [1 * MIN, 10 * MIN, 1 * DAY, 3 * DAY, 8 * DAY, 21 * DAY, 60 * DAY];
const MASTERED_STEP = 5; // 21 days
const LEECH_LAPSES = 4;

function newRecord(now, introducedOn) {
  return { step: 0, dueAt: now, lapses: 0, introducedOn: introducedOn || null };
}

function rate(record, rating, now) {
  const next = Object.assign({}, record);
  if (rating === "znam") {
    next.step = Math.min(record.step + 1, LADDER.length - 1);
    next.dueAt = now + LADDER[next.step];
  } else if (rating === "skoro") {
    next.dueAt = now + LADDER[1];
  } else {
    next.lapses = (record.lapses || 0) + 1;
    next.step = 0;
    // A leech re-enters mid-ladder so it cannot crowd out the session.
    next.dueAt = now + (next.lapses > LEECH_LAPSES ? LADDER[1] : LADDER[0]);
  }
  return next;
}

function isDue(record, now) {
  return !record || record.dueAt <= now;
}

function isMastered(record) {
  return !!record && record.step >= MASTERED_STEP;
}

function isLeech(record) {
  return !!record && (record.lapses || 0) >= LEECH_LAPSES;
}

if (typeof module !== "undefined") {
  module.exports = { LADDER, MASTERED_STEP, LEECH_LAPSES, newRecord, rate, isDue, isMastered, isLeech };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-scheduler.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add practice-scheduler.js scripts/test-scheduler.js
git commit -m "Add the graduated interval ladder behind speaking practice."
```

---

### Task 7: The intake brake

Depth over breadth, enforced per item.

**Files:**
- Modify: `practice-scheduler.js`
- Modify: `scripts/test-scheduler.js`

**Interfaces:**
- Produces: `admitNew(store, candidateKeys, now, today) -> string[]` — the keys allowed to be introduced right now.

- [ ] **Step 1: Write the failing test (append to `scripts/test-scheduler.js`)**

```js
const { admitNew, MAX_NEW_PER_DAY, OVERDUE_BRAKE } = require("../practice-scheduler.js");

need(MAX_NEW_PER_DAY === 5, "at most 5 new items a day");
need(OVERDUE_BRAKE === 10, "no new items while more than 10 are overdue");

const TODAY = "2026-09-12";
const cands = ["a", "b", "c", "d", "e", "f", "g"];

need(admitNew({}, cands, T0, TODAY).length === 5, "a cold store admits exactly the daily cap");

const introducedToday = {};
for (const k of ["a", "b", "c"]) introducedToday[k] = { step: 0, dueAt: T0, lapses: 0, introducedOn: TODAY };
need(
  admitNew(introducedToday, cands, T0, TODAY).length === 2,
  "already-introduced items count against the day's cap"
);

const backlog = {};
for (let i = 0; i < 11; i++) backlog["old" + i] = { step: 1, dueAt: T0 - DAY, lapses: 0, introducedOn: "2026-09-01" };
need(admitNew(backlog, cands, T0, TODAY).length === 0, "a backlog over the brake admits nothing");

const smallBacklog = {};
for (let i = 0; i < 9; i++) smallBacklog["old" + i] = { step: 1, dueAt: T0 - DAY, lapses: 0, introducedOn: "2026-09-01" };
need(admitNew(smallBacklog, cands, T0, TODAY).length === 5, "a backlog under the brake still admits");

const yesterday = {};
for (const k of ["a", "b", "c", "d", "e"]) yesterday[k] = { step: 1, dueAt: T0 + DAY, lapses: 0, introducedOn: "2026-09-11" };
need(admitNew(yesterday, cands, T0, TODAY).length === 2, "yesterday's intake does not count against today");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-scheduler.js`
Expected: FAIL — `admitNew is not a function`

- [ ] **Step 3: Write minimal implementation (append to `practice-scheduler.js`, before the exports)**

```js
const MAX_NEW_PER_DAY = 5;
const OVERDUE_BRAKE = 10;

// The depth-over-breadth mechanism. New material is admitted only when the
// existing queue is under control, so the learner never faces a wall of
// arrears - the usual way spaced repetition dies.
function admitNew(store, candidateKeys, now, today) {
  const records = Object.values(store);
  const overdue = records.filter((r) => r.dueAt <= now).length;
  if (overdue > OVERDUE_BRAKE) return [];

  const introducedToday = records.filter((r) => r.introducedOn === today).length;
  const room = MAX_NEW_PER_DAY - introducedToday;
  if (room <= 0) return [];

  return candidateKeys.filter((k) => !store[k]).slice(0, room);
}
```

Add `MAX_NEW_PER_DAY`, `OVERDUE_BRAKE`, and `admitNew` to `module.exports`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test-scheduler.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add practice-scheduler.js scripts/test-scheduler.js
git commit -m "Admit new material only when the review queue is under control."
```

---

### Task 8: Generate item audio

**Files:**
- Modify: `scripts/generate-audio.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: `STORY_ITEMS` (Task 5), `eachVariant` (Task 1).
- Produces: `audio/items/<variantId>/<itemId>.en.mp3` and `.hr.mp3`; full lines use the reserved id `line`.

`generate-audio.js` already has `loadDotEnv`, `synthesize(text, speed)`, and `writeClip(relPath, text)`. Extend rather than duplicate. The English voice must differ from Fran (`TRnNlYQWHAJwo9K75wNE`) so prompt and answer are never confusable — read it from `ELEVENLABS_EN_VOICE_ID` with a documented default.

**Two changes to existing code this task depends on:**

1. `generate-audio.js` currently requires `../stories.js` and `../books.js` — the *generated current week*, not the bank. Items are bank-wide and week-independent, so this task must additionally `require("./story-bank.js")`. Do not repoint the existing story/book passes at the bank.
2. `writeClip(relPath, text)` takes two arguments and always uses the Croatian voice. Widen it to `writeClip(relPath, text, { voice = "hr" } = {})` and have it pick the voice id from that option. The existing call sites pass no third argument and must keep working unchanged.

- [ ] **Step 1: Add an `--items` pass**

Add a `synthesizeEn(text)` alongside the existing Croatian path (same call, different voice id, speed `1.0` — the English prompt is not being taught, so it should not be slowed). Then:

```js
async function generateItems() {
  const bank = require("./story-bank.js");
  const STORY_ITEMS = require("../story-items.js");
  const { eachVariant } = require("./variant-ids.js");
  for (const { variantId, variant } of eachVariant(bank)) {
    const items = STORY_ITEMS[variantId] || [];
    // Every line is itself an item, under the reserved id "line".
    const all = items.concat(
      variant.lines.map((line, lineIndex) => ({ lineIndex, id: "line", hr: line.hr, en: line.en }))
    );
    for (const it of all) {
      const base = `audio/items/${variantId}/${it.lineIndex}-${it.id}`;
      await writeClip(`${base}.hr.mp3`, it.hr, { voice: "hr" });
      await writeClip(`${base}.en.mp3`, it.en, { voice: "en" });
    }
  }
}
```

Skip a clip whose file already exists unless `--force` is passed — the existing script already has this behaviour for stories; reuse it so a rerun is cheap.

- [ ] **Step 2: Dry-run against a single variant first**

Run: `node scripts/generate-audio.js --items --only tara-0`

Listen to two or three clips before generating ~800. Confirm the English
voice is clearly distinct from Fran and the Croatian is intelligible at word
length — single words are the most likely to synthesise oddly.

- [ ] **Step 3: Generate the rest**

Run: `node scripts/generate-audio.js --items`

- [ ] **Step 4: Document it**

Add a short section to `README.md` under the existing audio instructions covering `--items`, the `ELEVENLABS_EN_VOICE_ID` variable, and the `audio/items/` layout — matching the tone of the existing instructions.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-audio.js README.md audio/items
git commit -m "Generate English prompt and Croatian answer clips for every item."
```

---

### Task 9: The Govori tab

**Files:**
- Modify: `index.html` (markup, tab wiring, loop)
- Modify: `style.css`

**Interfaces:**
- Consumes: `STORY_ITEMS`, `practice-scheduler.js`, `audio/items/`.

The four top-level screens are switched by `showScreen()`, which hides all
siblings and stops audio and timers. Govori is a fifth screen and must be
registered there, or leaving it will leave its audio playing.

Record keys are `<storyId>|<variantId>|<lineIndex>-<itemId>`.

- [ ] **Step 1: Add the screen markup**

Add a `govoriScreen` section mirroring `quizScreen`'s structure: a `player-top` with a back link and a progress readout, a large prompt area, and a three-button rating row (`Znam` / `Skoro` / `Ne znam`). Add `Govori` to the existing tab row. Register `govoriScreen` in `showScreen()`'s screen list.

- [ ] **Step 2: Style it for a glance, not a read**

Rating buttons at least 64px tall, full width, generous gaps — this screen is used with the phone propped across the room. Reuse the existing `.quiz-check` / `.quiz-tile` tokens (`--accent-dim-bg`, `--accent-on-dim`, `--bg-elevated-1`, `--separator`) rather than introducing new colours.

- [ ] **Step 3: Implement the loop**

```js
// Pimsleur's anticipation loop: prompt in English, silence long enough to
// answer aloud, then the Croatian confirmation. The silence is derived from
// the answer clip's duration (PHRASE_PAUSE_MULT) so a single word gets a
// short beat and a full sentence a long one.
async function playGovoriItem(item) {
  await playClip(item.enAudio);
  const answer = await loadClip(item.hrAudio);
  await wait(answer.duration * PHRASE_PAUSE_MULT * 1000);
  await playClip(item.hrAudio);
  showRatings();
}
```

On a rating: `rate()` the record, persist, then advance to the next due item.
On first admission of a line, play its items bottom-up in one pass — word,
chunk, then the full line — before any of them become independently due.

- [ ] **Step 4: Persist to `nikola-practice`**

Mirror `loadLearn` / `saveLearn` exactly, including the try/catch — a cleared
or unavailable store must read as "everything is new", never as an error.
**Do not touch `nikola-learn`.**

- [ ] **Step 5: Verify in a browser**

```bash
npx serve -l 3099 .
```

Drive it the way the tile quiz was verified: confirm an English prompt plays,
a silence of the right length follows, the Croatian answer plays, each rating
moves the record as `test-scheduler.js` says it should, and the session ends
cleanly when nothing is due. Confirm leaving the tab stops the audio.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css
git commit -m "Add Govori: say it from memory, then hear it."
```

---

## Self-Review

- **Spec coverage:** Principles → Tasks 6/9. Two-audience split → honoured by never touching rotation (Global Constraints). Items → Tasks 1–5. Authoring/Wiktionary → Tasks 3–5. Govori mode → Task 9. Scheduling → Task 6. Intake brake → Task 7. Leeches → Task 6. Data → Task 9 Step 4. Audio → Task 8. Testing → Tasks 1–7. **Kviz typing (spec Phase 4) is deliberately not in this plan** — it is an independent subsystem and gets its own.
- **Placeholders:** none; every code step carries real code, and Task 4's deliverable is explicitly a measured number.
- **Type consistency:** `variantId` (Task 1) is used verbatim in Tasks 5, 8, 9. `sliceLine` returns `{id, kind, hr}` (Task 2), consumed unchanged in Tasks 4–5, which add `lineIndex` and `en`. Record shape `{step, dueAt, lapses, introducedOn}` is identical in Tasks 6, 7, 9. Rating strings `znam`/`skoro`/`neznam` are the same in Tasks 6 and 9. The reserved item id `line` is defined in Task 5 and used in Task 8.

## Known Risk

Task 4 exists because automatic glossing of inflected Croatian is unproven
here. It is a genuine stop-and-ask gate, not a formality: if words resolve
below 70%, the plan does not proceed on a guess.
