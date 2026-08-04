const BOOKS = [
  {
    id: "babys-belly-button",
    emoji: "👶",
    titleHr: "Gdje je bebin pupak?",
    titleEn: "Where Is Baby’s Belly Button?",
    lines: [
      { hr: "Gdje su bebine oči?", en: "Where are baby’s eyes?" },
      { hr: "Ispod njezinog šešira!", en: "Under her hat!" },
      { hr: "Gdje su bebina usta?", en: "Where is baby’s mouth?" },
      { hr: "Iza šalice!", en: "Behind the cup!" },
      { hr: "Gdje je bebin pupak?", en: "Where is baby’s belly button?" },
      { hr: "Ispod njezine majice!", en: "Under her shirt!" },
      { hr: "Gdje su bebina stopala?", en: "Where are baby’s feet?" },
      { hr: "Iza mačke!", en: "Behind the cat!" },
      { hr: "Gdje su bebine ruke?", en: "Where are baby’s hands?" },
      { hr: "Ispod mjehurića!", en: "Under the bubbles!" },
      { hr: "Gdje je beba?", en: "Where is baby?" },
      { hr: "Evo ga!", en: "There he is!" },
    ],
  },
  {
    id: "wheres-spot",
    emoji: "🐶",
    titleHr: "Gdje je Spot?",
    titleEn: "Where’s Spot?",
    lines: [
      { hr: "Taj Spot! Nije pojeo svoju večeru. Gdje bi mogao biti?", en: "That Spot! He hasn’t eaten his supper. Where can he be?" },
      { hr: "Je li iza vrata?", en: "Is he behind the door?" },
      { hr: "Ne, medvjed je iza vrata.", en: "No, the bear is behind the door." },
      { hr: "Je li u satu?", en: "Is he inside the clock?" },
      { hr: "Ne, zmija je u satu.", en: "No, the snake is inside the clock." },
      { hr: "Je li u klaviru?", en: "Is he in the piano?" },
      { hr: "Ne, nilski konj i ptica su u klaviru.", en: "No, the hippopotamus and the bird are in the piano." },
      { hr: "Je li ispod stepenica?", en: "Is he under the stairs?" },
      { hr: "Ne, lav je ispod stepenica.", en: "No, the lion is under the stairs." },
      { hr: "Je li u ormaru?", en: "Is he in the closet?" },
      { hr: "Ne, majmun je u ormaru.", en: "No, the monkey is in the closet." },
      { hr: "Je li ispod kreveta?", en: "Is he under the bed?" },
      { hr: "Ne, krokodil je ispod kreveta.", en: "No, the crocodile is under the bed." },
      { hr: "Je li u kutiji?", en: "Is he in the box?" },
      { hr: "Ne, ptice su u kutiji.", en: "No, the birds are in the box." },
      { hr: "Evo Spota! On je ispod tepiha.", en: "There’s Spot! He’s under the rug." },
      { hr: "Pokušaj s košarom!", en: "Try the basket!" },
      { hr: "Evo Spota! On je u košari.", en: "There’s Spot! He’s in the basket." },
      { hr: "Dobar dečko, Spot!", en: "Good boy, Spot!" },
    ],
  },
  {
    id: "little-monkey",
    emoji: "🐒",
    titleHr: "Mali majmun",
    titleEn: "Little Monkey",
    lines: [
      { hr: "Mali majmun je gladan i traži poslasticu,", en: "Little Monkey is hungry and looks for a treat," },
      { hr: "ali gdje može pronaći nešto ukusno za jelo?", en: "but where can he find something yummy to eat?" },
      { hr: "Njegovi prijatelji leptiri kažu da znaju za dobru užinu i obećavaju da će mu pokazati put tamo i natrag.", en: "His butterfly friends say they know a good snack, and promise to guide the way there and back." },
      { hr: "Dok se Mali majmun njiše s vrha stabla, pita se što bi večera mogla biti!", en: "As Little Monkey swings from the top of a tree, he wonders what dinner could possibly be!" },
      { hr: "Banane, naravno! Žute su i slatke.", en: "Bananas, of course! They are yellow and sweet." },
      { hr: "Mali majmun ih čak može uzeti nogama.", en: "Little Monkey can even pick them up with his feet." },
      { hr: "Mali majmun je sit, više ne može jesti.", en: "Little Monkey is full, he can’t eat any more." },
      { hr: "Iako je spreman za spavanje, mora učiniti još jednu stvar...", en: "Though he is ready for bed, he must do one thing more . . ." },
      { hr: "Zahvaljuje svojim prijateljima što su mu pokazali put i veseli se što će se ponovno igrati neki drugi dan.", en: "He thanks his friends for guiding the way, and looks forward to playing again some other day." },
      { hr: "Lijepo spavaj, Mali majmune!", en: "Sleep tight, Little Monkey!" },
    ],
  },
  {
    id: "peekaboo-rainbow",
    emoji: "🌈",
    titleHr: "Ku-ku, duga",
    titleEn: "Peekaboo Rainbow",
    lines: [
      { hr: "Ku-ku, duga!", en: "Peekaboo rainbow" },
      { hr: "Ku-ku, bubice!", en: "Peekaboo bugs" },
      { hr: "Ku-ku, kaktuse!", en: "Peekaboo cactus" },
      { hr: "Ku-ku, zagrljaji!", en: "Peekaboo hugs" },
      { hr: "Ku-ku, zečići!", en: "Peekaboo bunnies" },
      { hr: "Ku-ku, tko je?", en: "Peekaboo who?" },
      { hr: "Ku-ku, poljupci!", en: "Peekaboo kisses" },
      { hr: "Ku-ku… ti!", en: "Peekaboo… you!" },
    ],
  },
];

// Words that must lead into the next clause, never trail the previous one
// (conjunctions and short prepositions) - used by splitSentence() below.
// Duplicated from stories.js rather than shared, matching this project's
// pattern of self-contained data files with no cross-file dependencies.
const BOOK_LEADING_WORDS = new Set([
  "i", "ali", "pa", "te", "ili", "nego", "jer",
  "u", "na", "do", "od", "za", "sa", "s", "po", "iz", "kroz", "uz", "niz",
]);

// Auxiliary clitics that stay attached to the participle before them
// (e.g. "živjela je", not "živjela" / "je ...") - used by splitSentence() below.
const BOOK_TRAILING_CLITICS = new Set(["je", "sam", "si", "smo", "ste", "su"]);

function stripBookWord(word) {
  return word.replace(/[.,!?"]+$/, "").toLowerCase();
}

// Splits a sentence into two halves for "Polako" (slow) mode - see stories.js
// for the full rationale. Identical logic, applied to BOOKS instead of STORIES.
function splitBookSentence(text) {
  const commaIdx = text.indexOf(",");
  if (commaIdx !== -1 && commaIdx > text.length * 0.25 && commaIdx < text.length * 0.75) {
    return [text.slice(0, commaIdx + 1).trim(), text.slice(commaIdx + 1).trim()];
  }

  const words = text.split(" ");
  let mid = Math.ceil(words.length / 2);

  if (mid > 1 && BOOK_LEADING_WORDS.has(stripBookWord(words[mid - 1]))) {
    mid -= 1;
  }
  if (mid < words.length - 1 && BOOK_TRAILING_CLITICS.has(stripBookWord(words[mid]))) {
    mid += 1;
  }

  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

// Audio file path convention: book-audio/<bookId>/lineNN.mp3 (1-indexed, zero-padded to 2
// digits) - a SEPARATE root from Stories' audio/ folder.
// Slow-mode halves are separate files: book-audio/<bookId>/lineNN-slow-a.mp3 / -slow-b.mp3.
// Generated by scripts/generate-audio.js, same as stories.
BOOKS.forEach((book) => {
  book.lines.forEach((line, i) => {
    const n = String(i + 1).padStart(2, "0");
    line.audio = `book-audio/${book.id}/line${n}.mp3`;
    line.audioSlowA = `book-audio/${book.id}/line${n}-slow-a.mp3`;
    line.audioSlowB = `book-audio/${book.id}/line${n}-slow-b.mp3`;
    const [half1, half2] = splitBookSentence(line.hr);
    line.hrHalf1 = half1;
    line.hrHalf2 = half2;
  });
});

// Node (generate-audio.js) needs this; browsers ignore it since `module` is undefined.
if (typeof module !== "undefined") module.exports = BOOKS;
