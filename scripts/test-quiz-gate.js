#!/usr/bin/env node
const { displayedStoriesFor } = require("../learn-gate.js");

const errors = [];
function need(cond, msg) {
  if (!cond) errors.push(msg);
}

const current = [
  { id: "s-tara", weekDate: "2026-09-07", titleHr: "Nova Tara" },
  { id: "s-baka", weekDate: "2026-09-07", titleHr: "Nova Baka" },
];
const previous = [
  { id: "s-tara", weekDate: "2026-08-31", titleHr: "Stara Tara" },
  { id: "s-baka", weekDate: "2026-08-31", titleHr: "Stara Baka" },
];

const noPrev = displayedStoriesFor(current, [], null, {});
need(noPrev[0].titleHr === "Nova Tara", "no previous week → show this week");

const held = displayedStoriesFor(current, previous, "2026-08-31", {});
need(held[0].titleHr === "Stara Tara", "unpassed quiz → keep last week's Tara");
need(held[1].titleHr === "Stara Baka", "unpassed quiz → keep last week's Baka");

const mixed = displayedStoriesFor(current, previous, "2026-08-31", {
  "s-tara:2026-08-31": true,
});
need(mixed[0].titleHr === "Nova Tara", "passed Tara quiz → replace Tara");
need(mixed[1].titleHr === "Stara Baka", "unpassed Baka quiz → keep Baka");

const wrongKey = displayedStoriesFor(current, previous, "2026-08-31", {
  "s-tara:2026-09-07": true,
});
need(wrongKey[0].titleHr === "Stara Tara", "passing this week's key must not unlock last week");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("OK: quiz gate holds a story until that week's quiz is passed.");
