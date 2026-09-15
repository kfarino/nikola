// Typed quiz answers and verb-form cloze. Shared by the app and
// scripts/test-quiz-typing.js.

// č ć ž š đ typed without their marks. A phone keyboard makes these easy to
// skip, and the quiz should test the Croatian rather than the thumbs.
function foldDiacritics(text) {
  return text
    .replace(/[čć]/g, "c")
    .replace(/[ČĆ]/g, "C")
    .replace(/ž/g, "z")
    .replace(/Ž/g, "Z")
    .replace(/š/g, "s")
    .replace(/Š/g, "S")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeTyped(text) {
  return text.trim().toLowerCase().replace(/[.!?,]+$/, "").replace(/\s+/g, " ");
}

// { ok, exact }: exact is false when only the diacritics were off, so the
// caller can accept the answer but still show the real spelling.
function checkTyped(answer, correct) {
  const a = normalizeTyped(answer);
  const c = normalizeTyped(correct);
  if (!a) return { ok: false, exact: false };
  if (a === c) return { ok: true, exact: true };
  if (foldDiacritics(a) === foldDiacritics(c)) return { ok: true, exact: false };
  return { ok: false, exact: false };
}

function bareToken(word) {
  return word.replace(/^[„“”"«»]+|[.,!?;:„“”"«»]+$/g, "");
}

// Conjugated forms of the story's focus verb, found in its own lines. Every
// variant's focusHr is hand-authored, and most are infinitives ("kuhati"), so
// a stem match finds "kuha" without a dictionary. Only infinitives qualify
// (-ti / -ći), a form may not be longer than the infinitive - which keeps
// "kuhinji" from counting as a form of "kuhati" - and the infinitive itself
// is skipped, since blanking it with itself as the hint teaches nothing.
function focusForms(story) {
  const head = ((story && story.focusHr) || "").split(/\s+/)[0].toLowerCase();
  if (!/(ti|ći)$/.test(head)) return [];
  const base = head.replace(/(ti|ći)$/, "");
  const stem = base.slice(0, Math.max(3, base.length - 2));
  if (stem.length < 3) return [];

  const out = [];
  for (const line of story.lines || []) {
    for (const word of line.hr.split(/\s+/)) {
      const form = bareToken(word);
      const lower = form.toLowerCase();
      if (!lower.startsWith(stem)) continue;
      if (lower.length > head.length || lower === head) continue;
      if (!out.some((o) => o.line === line && o.form === form)) out.push({ form, line });
    }
  }
  return out;
}

// The line with that one word blanked out, punctuation left in place.
function clozeText(hr, form) {
  let done = false;
  return hr
    .split(/(\s+)/)
    .map((part) => {
      if (done || bareToken(part) !== form) return part;
      done = true;
      return part.replace(form, "___");
    })
    .join("");
}

if (typeof module !== "undefined") {
  module.exports = { foldDiacritics, checkTyped, focusForms, clozeText };
}
