#!/usr/bin/env node
// Guards the karaoke auto-scroll accumulator.
//
// Regression this exists for: the performance screen once accumulated its
// scroll position directly in `karaokeViewport.scrollTop`. The browser snaps
// scrollTop to whole device pixels, and at the rates this screen uses
// (Brzina 1 = 5px/sec ~= 0.08px per frame) the whole increment was rounded
// away on every readback, so the lyrics sat still at the default speed on
// every device. The position has to accumulate in a float that scrollTop is
// written *from*, never read back into.
const fs = require("fs");
const path = require("path");

const errors = [];
function need(cond, msg) {
  if (!cond) errors.push(msg);
}

// --- 1. The mechanism, in isolation --------------------------------------
// A viewport whose scrollTop snaps to device pixels, like a real one.
function makeViewport(dpr) {
  let raw = 0;
  const q = 1 / dpr;
  return {
    get scrollTop() { return raw; },
    set scrollTop(v) { raw = Math.floor(v / q) * q; },
  };
}

function run({ accumulateInScrollTop, speed, dpr, seconds = 10, fps = 60 }) {
  const vp = makeViewport(dpr);
  const dt = 1 / fps;
  let pos = 0;
  for (let i = 0; i < seconds * fps; i++) {
    pos = (accumulateInScrollTop ? vp.scrollTop : pos) + speed * dt;
    vp.scrollTop = pos;
  }
  return vp.scrollTop;
}

const SPEED_MIN = 5; // KARAOKE_MIN_SPEED, and the default
for (const dpr of [1, 2, 3]) {
  need(
    run({ accumulateInScrollTop: true, speed: SPEED_MIN, dpr }) === 0,
    `dpr=${dpr}: reading position back out of scrollTop should freeze (it is the old bug)`
  );
  const moved = run({ accumulateInScrollTop: false, speed: SPEED_MIN, dpr });
  need(
    Math.abs(moved - SPEED_MIN * 10) < 0.001,
    `dpr=${dpr}: float accumulator should advance ${SPEED_MIN * 10}px in 10s, got ${moved.toFixed(2)}px`
  );
}

// --- 2. The real source still does it that way ---------------------------
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

const frame = html.match(/function karaokeFrame\(now\)[\s\S]*?\n    }/);
need(frame !== null, "karaokeFrame() not found in index.html");
if (frame) {
  const body = frame[0];
  need(
    /let next = karaokePos \+ karaokeSpeed \* deltaSec;/.test(body),
    "karaokeFrame() must accumulate from the karaokePos float"
  );
  need(
    !/scrollTop/.test(body) && !/karaokeScrollPos\(\)/.test(body),
    "karaokeFrame() must not read the position back off scrollTop"
  );
}

need(
  /karaokePos = karaokeViewport\.scrollTop;/.test(html),
  "auto-scroll must re-sync from scrollTop after a finger drag moves the pane"
);

if (errors.length) {
  console.error("FAIL:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("OK: karaoke auto-scroll accumulates in a float; slowest speed still advances.");
