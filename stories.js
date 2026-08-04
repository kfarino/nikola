const STORIES = [
  {
    id: "turtle",
    emoji: "🐢",
    titleHr: "Kornjača i cvijet",
    titleEn: "The Turtle and the Flower",
    lines: [
      { hr: "Jedna mala kornjača živjela je blizu mirnog jezera.", en: "A little turtle lived near a peaceful lake." },
      { hr: "Svakog jutra polako je plivala do cvijeta i pričala mu priče.", en: "Every morning, she slowly swam to the flower and told it stories." },
      { hr: "Kornjača je pričala.", en: "The turtle talked." },
      { hr: "Cvijet je slušao.", en: "The flower listened." },
      { hr: "Kornjača je opet pričala.", en: "The turtle talked again." },
      { hr: "Cvijet je opet slušao.", en: "The flower listened again." },
      { hr: "Kornjača i cvijet bili su najbolji prijatelji.", en: "The turtle and the flower were best friends." },
    ],
  },
  {
    id: "rabbit",
    emoji: "🐇",
    titleHr: "Hrabri zec",
    titleEn: "The Brave Rabbit",
    lines: [
      { hr: "Jedan mali zec živio je na rubu velike šume.", en: "A little rabbit lived at the edge of a big forest." },
      { hr: "Zec se bojao mraka.", en: "The rabbit was afraid of the dark." },
      { hr: "Ali svake večeri, zec je disao duboko.", en: "But every evening, the rabbit breathed deeply." },
      { hr: "Zec je zakoraknuo naprijed.", en: "The rabbit stepped forward." },
      { hr: "Zec je opet zakoraknuo naprijed.", en: "The rabbit stepped forward again." },
      { hr: "Zec je naučio da je hrabrost mali korak svaki dan.", en: "The rabbit learned that courage is a small step each day." },
    ],
  },
  {
    id: "squirrel",
    emoji: "🐿️",
    titleHr: "Vjeverica i orah",
    titleEn: "The Squirrel and the Walnut",
    lines: [
      { hr: "Jedna mala vjeverica našla je veliki orah.", en: "A little squirrel found a big walnut." },
      { hr: "Vjeverica je htjela pojesti orah sama.", en: "The squirrel wanted to eat the walnut alone." },
      { hr: "Ali ptica je bila gladna.", en: "But a bird was hungry." },
      { hr: "Vjeverica je podijelila orah s pticom.", en: "The squirrel shared the walnut with the bird." },
      { hr: "Zajedno su bili sretni.", en: "Together they were happy." },
      { hr: "Vjeverica je naučila da je dijeljenje najbolji dar.", en: "The squirrel learned that sharing is the best gift." },
    ],
  },
  {
    id: "penguin",
    emoji: "🐧",
    titleHr: "Mali pingvin i kupanje",
    titleEn: "Little Penguin's Bath",
    lines: [
      { hr: "Mali pingvin bio je umoran nakon dugog dana.", en: "Little penguin was tired after a long day." },
      { hr: "Mama je rekla: \"Vrijeme je za kupanje.\"", en: "Mom said: \"It's time for a bath.\"" },
      { hr: "Pingvin je oprao krila i noge.", en: "Penguin washed his wings and feet." },
      { hr: "Voda je bila topla i pingvin je bio sretan.", en: "The water was warm and penguin was happy." },
      { hr: "Nakon kupanja, pingvin je obukao pidžamu.", en: "After the bath, penguin put on pajamas." },
      { hr: "Mama je pjevala tihu pjesmu.", en: "Mom sang a quiet song." },
      { hr: "Pingvin je zaspao mirno.", en: "Penguin fell asleep peacefully." },
      { hr: "Laku noć, mali pingvine.", en: "Goodnight, little penguin." },
    ],
  },
  {
    id: "star",
    emoji: "⭐",
    titleHr: "Mala zvijezda",
    titleEn: "The Little Star",
    lines: [
      { hr: "Jedna mala zvijezda htjela je sjati najjače na nebu.", en: "A little star wanted to shine the brightest in the sky." },
      { hr: "Mjesec je rekao: \"Svaka zvijezda sja na svoj način.\"", en: "The moon said: \"Every star shines in its own way.\"" },
      { hr: "Zvijezda je sjala tiho.", en: "The star shone quietly." },
      { hr: "Zvijezda je bila sretna.", en: "The star was happy." },
      { hr: "Sada je vrijeme za spavanje.", en: "Now it's time to sleep." },
      { hr: "Laku noć, mala zvijezdo.", en: "Goodnight, little star." },
    ],
  },
  {
    id: "noisy-dog",
    emoji: "🐕",
    titleHr: "Bučni pas",
    titleEn: "The Noisy Dog",
    lines: [
      { hr: "Jedan mali pas volio je praviti buku.", en: "A little dog loved to make noise." },
      { hr: "Pas je lajao ujutro.", en: "The dog barked in the morning." },
      { hr: "Pas je lajao navečer.", en: "The dog barked in the evening." },
      { hr: "Pas je lajao i noću.", en: "The dog barked at night too." },
      { hr: "Susjedi su rekli: \"Bučni pase, tiho!\"", en: "The neighbors said: \"Noisy dog, quiet!\"" },
      { hr: "Pas je disao duboko i stišao se.", en: "The dog breathed deeply and got quiet." },
      { hr: "Sada pas laje samo kad se igra.", en: "Now the dog only barks when he plays." },
    ],
  },
  {
    id: "rainbow-worm",
    emoji: "🪱",
    titleHr: "Dugin crvić",
    titleEn: "The Rainbow Worm",
    lines: [
      { hr: "Jedan mali crvić živio je u vrtu.", en: "A little worm lived in the garden." },
      { hr: "Nakon kiše, crvić je ugledao dugu.", en: "After the rain, the worm saw a rainbow." },
      { hr: "Crvić je poželio biti šaren kao duga.", en: "The worm wished to be colorful like the rainbow." },
      { hr: "Sunce je zagrijalo crvićevu kožu.", en: "The sun warmed the worm's skin." },
      { hr: "Crvić je zasjao crvenom, narančastom i žutom.", en: "The worm glowed red, orange, and yellow." },
      { hr: "Zatim zelenom, plavom i ljubičastom.", en: "Then green, blue, and purple." },
      { hr: "Dugin crvić smiješio se cijelom vrtu.", en: "The rainbow worm smiled at the whole garden." },
      { hr: "Laku noć, dugin crviću.", en: "Goodnight, rainbow worm." },
    ],
  },
];

// Words that must lead into the next clause, never trail the previous one
// (conjunctions and short prepositions) - used by splitSentence() below.
const LEADING_WORDS = new Set([
  "i", "ali", "pa", "te", "ili", "nego", "jer",
  "u", "na", "do", "od", "za", "sa", "s", "po", "iz", "kroz", "uz", "niz",
]);

// Auxiliary clitics that stay attached to the participle before them
// (e.g. "živjela je", not "živjela" / "je ...") - used by splitSentence() below.
const TRAILING_CLITICS = new Set(["je", "sam", "si", "smo", "ste", "su"]);

function stripWord(word) {
  return word.replace(/[.,!?"]+$/, "").toLowerCase();
}

// Splits a sentence into two halves for "Polako" (slow) mode, which speaks each
// half separately with a pause in between. Prefers splitting at a comma near the
// middle (a natural clause break); otherwise splits at the nearest word boundary,
// nudged to avoid stranding a leading conjunction/preposition or an auxiliary
// clitic on the wrong side of the split.
function splitSentence(text) {
  const commaIdx = text.indexOf(",");
  if (commaIdx !== -1 && commaIdx > text.length * 0.25 && commaIdx < text.length * 0.75) {
    return [text.slice(0, commaIdx + 1).trim(), text.slice(commaIdx + 1).trim()];
  }

  const words = text.split(" ");
  let mid = Math.ceil(words.length / 2);

  if (mid > 1 && LEADING_WORDS.has(stripWord(words[mid - 1]))) {
    mid -= 1;
  }
  if (mid < words.length - 1 && TRAILING_CLITICS.has(stripWord(words[mid]))) {
    mid += 1;
  }

  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

// Audio file path convention: audio/<storyId>/lineNN.mp3 (1-indexed, zero-padded to 2 digits).
// Slow-mode halves are separate files: audio/<storyId>/lineNN-slow-a.mp3 / -slow-b.mp3.
// Generated separately by scripts/generate-audio.js — not hand-written here so story text
// can be edited freely without needing to renumber file references.
STORIES.forEach((story) => {
  story.lines.forEach((line, i) => {
    const n = String(i + 1).padStart(2, "0");
    line.audio = `audio/${story.id}/line${n}.mp3`;
    line.audioSlowA = `audio/${story.id}/line${n}-slow-a.mp3`;
    line.audioSlowB = `audio/${story.id}/line${n}-slow-b.mp3`;
    const [half1, half2] = splitSentence(line.hr);
    line.hrHalf1 = half1;
    line.hrHalf2 = half2;
  });
});

// Node (generate-audio.js) needs this; browsers ignore it since `module` is undefined.
if (typeof module !== "undefined") module.exports = STORIES;
