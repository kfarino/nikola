#!/usr/bin/env node
const { foldDiacritics, checkTyped, focusForms, clozeText } = require("../quiz-typing.js");
const STORIES = require("../stories.js");

const errors = [];
function need(cond, msg) {
  if (!cond) errors.push(msg);
}

need(foldDiacritics("učiti čak žena šuma đak") === "uciti cak zena suma dak", "folds č ć ž š đ");

const exact = checkTyped("  Kuha. ", "kuha");
need(exact.ok && exact.exact, "case, spacing and end punctuation are ignored");
const folded = checkTyped("uci", "uči");
need(folded.ok && !folded.exact, "missing diacritics are accepted but flagged");
need(!checkTyped("kuhaju", "kuha").ok, "a wrong ending is wrong");
need(!checkTyped("", "kuha").ok, "an empty answer is wrong");
need(checkTyped("penjati se", "penjati se").ok, "multi-word answers work");

const kuhati = {
  focusHr: "kuhati",
  lines: [
    { hr: "Baka kuha ručak u kuhinji.", en: "Baka cooks lunch in the kitchen." },
    { hr: "Tata voli kuhati.", en: "Tata likes to cook." },
  ],
};
const forms = focusForms(kuhati).map((f) => f.form);
need(forms.includes("kuha"), `kuhati should find "kuha", got ${JSON.stringify(forms)}`);
need(!forms.includes("kuhinji"), "a longer word sharing the stem is not a form");
need(!forms.includes("kuhati"), "the infinitive itself is not a cloze");

need(focusForms({ focusHr: "dati", lines: [{ hr: "Baka daje keks.", en: "" }] }).length === 0, "dati's stem is too short to match safely");
need(focusForms({ focusHr: "obitelj", lines: [{ hr: "Obitelj je tu.", en: "" }] }).length === 0, "nouns get no cloze");
need(focusForms({ focusHr: "penjati se", lines: [{ hr: "Tara se penje gore.", en: "" }] })[0].form === "penje", "reflexive infinitives use their head word");

need(clozeText("Baka kuha ručak u kuhinji.", "kuha") === "Baka ___ ručak u kuhinji.", "blanks the word");
need(clozeText("Tara se penje.", "penje") === "Tara se ___.", "keeps trailing punctuation");

for (const story of STORIES) {
  for (const { form, line } of focusForms(story)) {
    need(line.hr.includes(form), `${story.id}: "${form}" is not in its line`);
    need(clozeText(line.hr, form).includes("___"), `${story.id}: could not blank "${form}"`);
  }
}

if (errors.length) {
  console.error("FAIL:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("OK: typed answers fold diacritics; focus-verb forms and cloze lines come from the story itself.");
