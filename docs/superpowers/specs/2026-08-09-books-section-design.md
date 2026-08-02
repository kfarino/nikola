# Books section design

## Context

Third home-screen section (after Priče, Pjesme): a Croatian reading companion for physical books the user reads to their son. Unlike Songs, Books needs audio (same ElevenLabs pipeline as Stories) since it's read the same way stories are.

**Copyright constraint (established with the user):** I do not view, transcribe, or translate any copyrighted book's text - not from images, not piecemeal. The user types in the English original and their own Croatian translation themselves, per line, exactly like Songs' lyrics. This spec ships only a clearly-fictional example entry (not any real book) so the user can see the exact shape to follow. No page images/illustrations are stored - text only, since this is a reading companion used alongside the physical book in hand.

## Approach

**Reuse Stories' exact data shape and player mechanics rather than building a parallel system.** `BOOKS` entries are shaped identically to `STORIES` entries (`{ id, titleHr, titleEn, lines: [{hr, en}] }`), processed through the same per-line pipeline (audio path filling, `splitSentence()` for Polako halves) - so the existing player screen, `advance()` state machine, pause/resume, and Polako slow-mode all work for Books with no new reader code. This also directly satisfies "let me choose where the sentences break": a `lines` entry is whatever chunk of text the user decides (a whole page, one sentence, a phrase) - identical freedom to how story lines already work.

### 1. `books.js` - data file (parallel to `stories.js`, same processing pipeline)

```js
const BOOKS = [
  {
    id: "example-book",
    titleHr: "Primjer knjige",
    titleEn: "Example Book",
    lines: [
      { hr: "Ovo je primjer rečenice.", en: "This is an example sentence." },
      { hr: "Svaki redak može biti cijela stranica, jedna rečenica, ili samo dio rečenice.", en: "Each line can be a whole page, one sentence, or just part of a sentence." },
      { hr: "Ti biraš gdje se tekst dijeli - baš kao kod priča.", en: "You choose where the text breaks - just like with stories." },
    ],
  },
];

// Same audio path convention and splitSentence()/hrHalf1/hrHalf2 pipeline as stories.js,
// reusing the identical function (moved to be shared, or duplicated verbatim - see Task 1).
STORIES-style processing loop, but audio paths use audio/<bookId>/lineNN.mp3 - the same
audio/ root Stories already uses (ids are unique across the app, so no collision).

if (typeof module !== "undefined") module.exports = BOOKS;
```

### 2. Home screen: three-way tab (Priče / Pjesme / Knjige)

Extend the existing `.speed-toggle-group` segmented control from two options to three. Knjige cards reuse the `.story-card` layout, but with English and Croatian swapped from how Priče cards show them: `titleEn` in the bold `.hr` slot, `titleHr` in the muted `.en` slot - satisfying "keep selection screen titles in English" with zero new CSS.

### 3. Reader: generalize `selectStory` into a shared `selectContent(id, list)`

```js
function selectContent(id, list) {
  story = list.find((s) => s.id === id) || list[0];
  contentKind = list === BOOKS ? "book" : "story";
  // ...rest identical to current selectStory body
}
function selectStory(id) { selectContent(id, STORIES); }
function selectBook(id) { selectContent(id, BOOKS); }
```

`contentKind` drives the two content-specific bits: `showDone()`'s heading text ("Kraj priče" vs "Kraj knjige") and the URL param (`?story=`/`?book=`) `syncFromUrl()` checks and `history.pushState` writes. Everything else (`advance()`, `attemptPlay()`, `playCurrent()`, Polako toggle, pause) is unchanged and content-agnostic already, since it only ever reads `story.lines`/`story.emoji`-free fields already generic.

### 4. `scripts/generate-audio.js` - process both STORIES and BOOKS

Require `../books.js` alongside `../stories.js` and loop over `[...STORIES, ...BOOKS]` so a single script run keeps both in sync once real book text exists.

### 5. `README.md`

Add an "Adding a book" section mirroring "Adding or editing a story," stating explicitly: never AI-transcribe/translate a real book's text - type in the English original and your own Croatian translation yourself, breaking lines wherever you want (a whole page, a sentence, a phrase).

## Verification

No test framework; verify via the same parse-check pattern used for Songs/Stories, plus a manual trace that `selectStory`/`selectBook` both correctly set `contentKind` and that the done-screen text and URL param differ correctly between the two.
