#!/usr/bin/env node
const STORIES = require("../stories.js");
const bank = require("./story-bank");
const { phraseIssues } = require("./croatian-checks");

const STORY_DATE = STORIES.STORY_DATE;
const errors = [];

function need(cond, msg) {
  if (!cond) errors.push(msg);
}

function blobHas(blob, re, msg) {
  need(re.test(blob), msg);
}

need(typeof STORY_DATE === "string" && /^\d{4}-\d{2}-\d{2}$/.test(STORY_DATE), "STORY_DATE missing");
need(STORIES.length === 4, `expected 4 stories, got ${STORIES.length}`);
need(STORIES.some((s) => s.id === "s-tara"), "s-tara missing");
need(STORIES.some((s) => s.id === "s-baka"), "s-baka missing");
need(STORIES.some((s) => s.id === "s-odlazak"), "s-odlazak missing");
need(STORIES.some((s) => s.id === "s-sada"), "s-sada missing");

const allHr = STORIES.map((s) => s.lines.map((l) => l.hr).join(" ")).join(" ");
blobHas(allHr, /\bide\b|\bidu\b/, "core verb ići missing this week");
blobHas(allHr, /\bvidi\b/, "core verb vidjeti missing this week");
blobHas(allHr, /\bhoće\b/, "core verb htjeti missing this week");
blobHas(allHr, /\bdaje\b|\bdaju\b/, "core verb dati missing this week");
blobHas(allHr, /\bkaže\b/, "core verb kaže missing this week");

STORIES.forEach((story) => {
  need(story.lines.length === 10, `${story.id} has ${story.lines.length} lines`);
  need(story.focusHr, `${story.id} missing focusHr`);
  need(story.weekDate === STORY_DATE, `${story.id} weekDate mismatch`);
  story.lines.forEach((line, i) => {
    need(
      line.audio === `audio/${story.id}/${story.weekDate}/line${String(i + 1).padStart(2, "0")}.mp3`,
      `${story.id} line ${i + 1} audio path`
    );
    need(!line.audioSlowA && !line.hrHalf1, `${story.id} still has Polako fields`);
    phraseIssues(line.hr).forEach((issue) => {
      errors.push(`${story.id} line ${i + 1}: "${line.hr}" — ${issue}`);
    });
  });
});

if (process.argv.includes("--bank")) {
  function walk(label, variant) {
    (variant.lines || []).forEach((line, li) => {
      phraseIssues(line.hr).forEach((issue) => {
        errors.push(`${label} line ${li + 1}: "${line.hr}" — ${issue}`);
      });
    });
  }
  ["tara", "baka", "mama", "tata"].forEach((key) => {
    bank[key].variants.forEach((v, i) => walk(`${key}[${i}]`, v));
  });
  Object.entries(bank.sada.variants).forEach(([k, v]) => walk(`sada.${k}`, v));
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: ${STORIES.length} stories for ${STORY_DATE}, present-tense 5–6 word chunks, core verbs present.`);
