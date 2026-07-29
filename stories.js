const STORIES = [
  {
    id: "turtle",
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
];

// Audio file path convention: audio/<storyId>/lineNN.mp3 (1-indexed, zero-padded to 2 digits).
// Generated separately by scripts/generate-audio.js — not hand-written here so story text
// can be edited freely without needing to renumber file references.
STORIES.forEach((story) => {
  story.lines.forEach((line, i) => {
    const n = String(i + 1).padStart(2, "0");
    line.audio = `audio/${story.id}/line${n}.mp3`;
  });
});

// Node (generate-audio.js) needs this; browsers ignore it since `module` is undefined.
if (typeof module !== "undefined") module.exports = STORIES;
