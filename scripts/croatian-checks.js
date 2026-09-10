// Shared checks for the daily story bank and the generated stories.js.
// Present-tense only: Croatian perfect (je + l-participle) is rejected so
// fable-past cannot slip back in while the parent is still collecting verbs.

const PAST_PARTICIPLES = new Set([
  "bio", "bila", "bilo", "bili", "bile",
  "išao", "išla", "išlo", "išli", "išle",
  "došao", "došla", "došlo", "došli", "došle",
  "otišao", "otišla", "otišlo", "otišli", "otišle",
  "vidio", "vidjela", "vidjelo", "vidjeli", "vidjele",
  "rekao", "rekla", "reklo", "rekli", "rekle",
  "dao", "dala", "dalo", "dali", "dale",
  "htio", "htjela", "htjelo", "htjeli", "htjele",
  "mogao", "mogla", "moglo", "mogli", "mogle",
  "našao", "našla", "našlo", "našli", "našle",
  "uzeo", "uzela", "uzelo", "uzeli", "uzele",
  "pojeo", "pojela", "pojelo", "pojeli", "pojele",
  "popio", "popila", "popilo", "popili", "popile",
  "trčao", "trčala", "trčalo", "trčali", "trčale",
  "plivao", "plivala", "plivalo", "plivali", "plivale",
  "živjela", "živjelo", "živjeli", "živjele", "živio",
  "naučio", "naučila", "naučilo", "naučili", "naučile",
  "bojao", "bojala", "bojalo", "bojali", "bojale",
  "disao", "disala", "disalo", "disali", "disale",
  "pao", "pala", "palo",
  "sjeo", "sjela", "sjelo", "sjeli", "sjele",
  "čuo", "čula", "čulo", "čuli", "čule",
  "gledao", "gledala", "gledalo", "gledali", "gledale",
  "igrao", "igrala", "igralo", "igrali", "igrale",
  "radio", "radila", "radilo", "radili", "radile",
  "kuhao", "kuhala", "kuhalo", "kuhali", "kuhale",
  "pekao", "pekla", "peklo", "pekli", "pekle",
  "bacao", "bacala", "bacalo", "bacali", "bacale",
  "trčao", "stao", "stala", "stalo", "stali", "stale",
  "legao", "legla", "leglo", "legli", "legle",
  "zakoraknuo", "zakoraknula",
  "plivala", "pričala", "slušao", "slušala",
  "oprao", "oprala", "obukao", "obukla",
  "pjevao", "pjevala", "zaspao", "zaspala",
  "sjao", "sjala", "rekao",
  "lajao", "lajala", "štišao", "štišala",
  "ugledao", "ugledala", "poželio", "poželjela",
  "zagrijao", "zagrijala", "zasjao", "zasjala",
  "smiješio", "smiješila",
]);

const AUX = new Set(["sam", "si", "je", "smo", "ste", "su"]);

function stripPunct(word) {
  return word.replace(/^[„“”"«»]+|[.,!?;:„“”"«»]+$/g, "").toLowerCase();
}

function words(text) {
  return text.trim().split(/\s+/).filter(Boolean).map(stripPunct).filter(Boolean);
}

function wordCount(text) {
  return words(text).length;
}

function pastTenseHits(text) {
  const tokens = words(text);
  const hits = [];
  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    if (PAST_PARTICIPLES.has(w)) hits.push(w);
    if (AUX.has(w) && i + 1 < tokens.length && PAST_PARTICIPLES.has(tokens[i + 1])) {
      hits.push(`${w} ${tokens[i + 1]}`);
    }
  }
  // Future clitic "će" as its own word only. Do not use /\bće\b/ — in JS
  // \w is ASCII, so "će" inside "hoće" / "cvijeće" looks like a boundary.
  if (tokens.includes("će")) hits.push("će (future)");
  return hits;
}

function phraseIssues(hr) {
  const issues = [];
  const n = wordCount(hr);
  if (n < 5 || n > 6) issues.push(`${n} words (need 5–6)`);
  const past = pastTenseHits(hr);
  if (past.length) issues.push(`past/future: ${past.join(", ")}`);
  return issues;
}

if (typeof module !== "undefined") {
  module.exports = { wordCount, words, pastTenseHits, phraseIssues };
}
