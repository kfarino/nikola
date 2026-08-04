# Songs Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second top-level section ("Pjesme" / Songs) to the app, alongside the existing "Priče" (Stories) section, so the user can pick a guitar song, see its chord chart, then follow a scrolling lyrics view (chords-as-corner-reference) while playing.

**Architecture:** Extend the existing single-page app in `index.html` (same show/hide-screen + `history.pushState` pattern already used for Stories) rather than adding a new page. Add `songs.js` as a sibling data file to `stories.js`. No new build tooling, no framework - plain HTML/CSS/JS, consistent with the rest of the repo.

**Tech Stack:** Vanilla HTML/CSS/JS, no build step, no dependencies. The project has no test framework; code-level checks (syntax, spot-checking data) are done per task, but manual browser click-through is left to the user as UAT rather than performed by whoever executes this plan.

## Global Constraints

- No build step, no framework, no npm dependencies - plain `<script>` tags only (per `README.md` and the existing `stories.js`/`index.html`/`style.css` structure).
- Reuse existing design tokens/classes from `style.css` (`--font-display`, `--label-*`, `--accent*`, `--bg-elevated-*`, `.icon-btn`, `.speed-option`, `.line-hr`/`.line-en` sizing) rather than introducing new ones - Songs must look like part of the same app, not a bolted-on feature.
- Lyric `text`/`lines` content stays blank (`""`) for every song - do not write in lyrics. Chords and section structure are transcribed from `songs/chord-charts/*.pdf` and are fine to include in full.
- All work happens directly in `index.html`'s existing inline `<script>` block and `style.css` - do not extract a separate JS file for this (matches current single-inline-script pattern; only `stories.js`/`songs.js` are separate files, and those are pure data).

---

### Task 1: `songs.js` data file

**Files:**
- Create: `songs.js`

**Interfaces:**
- Produces: global `SONGS` array, each entry shaped `{ id, title, artist, key, capo, sections }` where `sections` is `[{ label, chords: string[], lines: string[] }]`. `chords` is that section's chord progression in order (repeats collapse to the played sequence, not deduplicated to a set). `lines` is one empty string (`""`) per lyric line in that section - `[]` for purely instrumental sections (Intro/Solo/Interlude/Coda with no sung line).

- [ ] **Step 1: Write `songs.js`**

```js
const SONGS = [
  {
    id: "three-little-birds",
    title: "Three Little Birds",
    artist: "Bob Marley",
    key: "A",
    capo: null,
    sections: [
      { label: "Intro", chords: ["A"], lines: [] },
      { label: "Chorus", chords: ["A", "D", "A", "D"], lines: ["", "", "", ""] },
      { label: "Verse 1", chords: ["A", "E", "A", "D", "A", "E", "D", "A"], lines: ["", "", "", "", "", "", ""] },
      { label: "Chorus", chords: ["A", "D", "A", "D"], lines: ["", "", "", ""] },
      { label: "Verse 2", chords: ["A", "E", "A", "D", "A", "E", "D", "A"], lines: ["", "", "", "", "", "", ""] },
      { label: "Outro", chords: ["A", "D", "A", "D"], lines: ["", "", "", ""] },
      { label: "Fade Out", chords: ["A", "D", "A", "D"], lines: ["", "", "", ""] },
    ],
  },
  {
    id: "house-of-the-rising-sun",
    title: "House of the Rising Sun",
    artist: "The Animals",
    key: "Am",
    capo: null,
    sections: [
      { label: "Intro", chords: ["Am", "C", "D", "F", "Am", "E", "Am", "E"], lines: [] },
      { label: "Verse 1", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E", "Am", "C", "D", "F", "Am", "E", "Am", "E"], lines: ["", "", "", ""] },
      { label: "Verse 2", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E", "Am", "C", "D", "F", "Am", "E", "Am", "E"], lines: ["", "", "", ""] },
      { label: "Verse 3", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E", "Am", "C", "D", "F", "Am", "E", "Am", "E"], lines: ["", "", "", ""] },
      { label: "Organ Solo", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E", "Am", "C/E", "D", "F", "Am", "E", "Am", "E"], lines: [] },
      { label: "Verse 4", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E", "Am", "C", "D", "F", "Am", "E", "Am", "E"], lines: ["", "", "", ""] },
      { label: "Verse 5", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E", "Am", "C", "D", "F", "Am", "E", "Am", "E"], lines: ["", "", "", ""] },
      { label: "Verse 6", chords: ["Am", "C", "D", "F", "Am", "C", "E", "E", "Am", "C", "D", "F", "Am", "E7", "Am", "C", "D", "F7", "Am", "E7"], lines: ["", "", "", ""] },
      { label: "Coda", chords: ["Am", "Dm", "Am", "Dm", "Am", "Dm", "Am", "Dm", "Am", "Dm", "Am"], lines: [] },
    ],
  },
  {
    id: "have-you-ever-seen-the-rain",
    title: "Have You Ever Seen the Rain",
    artist: "Creedence Clearwater Revival",
    key: "C",
    capo: null,
    sections: [
      { label: "Intro", chords: ["Am", "F/C", "C", "G", "C"], lines: [] },
      { label: "Verse", chords: ["C", "C", "G", "C", "C", "C", "G", "C"], lines: ["", "", "", "", "", ""] },
      { label: "Chorus", chords: ["F", "G", "C", "C/B", "Am", "Am7/G", "F", "G", "C", "C/B", "Am", "Am7/G", "F", "G", "C"], lines: ["", "", "", "", ""] },
      { label: "Verse", chords: ["C", "C", "G", "C", "C", "C", "G", "C"], lines: ["", "", "", "", "", ""] },
      { label: "Chorus", chords: ["F", "G", "C", "C/B", "Am", "Am7/G", "F", "G", "C", "C/B", "Am", "Am7/G", "F", "G", "C"], lines: ["", "", "", "", ""] },
      { label: "Chorus", chords: ["F", "G", "C", "C/B", "Am", "Am7/G", "F", "G", "C", "C/B", "Am", "Am7/G", "F", "G", "C", "G", "C"], lines: ["", "", "", "", ""] },
    ],
  },
  {
    id: "be-my-baby",
    title: "Be My Baby",
    artist: "The Ronettes",
    key: "E",
    capo: null,
    sections: [
      { label: "Intro", chords: ["E"], lines: [] },
      { label: "Verse 1", chords: ["E", "F#m", "B7", "E", "F#m", "B7"], lines: ["", ""] },
      { label: "Pre-Chorus", chords: ["G#7", "C#7", "F#", "B7", "E"], lines: ["", "", "", ""] },
      { label: "Chorus", chords: ["C#m", "A", "B7"], lines: ["", "", "", ""] },
      { label: "Verse 2", chords: ["E", "F#m", "B7", "E", "F#m", "B7"], lines: ["", ""] },
      { label: "Pre-Chorus", chords: ["G#7", "C#7", "F#", "B7", "E"], lines: ["", "", "", ""] },
      { label: "Chorus", chords: ["C#m", "A", "B7"], lines: ["", "", "", ""] },
      { label: "Strings Solo", chords: ["F#m", "B7", "E", "F#m", "B7", "E"], lines: [] },
      { label: "Chorus", chords: ["C#m", "A", "B7", "E", "C#m", "A", "B7"], lines: ["", "", "", ""] },
      { label: "Outro (Fade out)", chords: ["E", "C#m", "A", "B7"], lines: [""] },
    ],
  },
  {
    id: "landslide",
    title: "Landslide",
    artist: "Fleetwood Mac",
    key: "C",
    capo: null,
    sections: [
      { label: "Intro", chords: ["C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B"], lines: [] },
      { label: "Verse 1", chords: ["C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7"], lines: ["", "", "", ""] },
      { label: "Verse 2", chords: ["G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "D7/F#"], lines: ["", "", "", "", ""] },
      { label: "Chorus", chords: ["G", "D/F#", "D7/F#", "Em", "C", "G/B", "Am7", "D7/F#", "G", "D/F#", "D7/F#", "Em", "C", "G/B", "Am7", "G/B"], lines: ["", "", "", "", ""] },
      { label: "Solo", chords: ["C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B"], lines: [] },
      { label: "Chorus", chords: ["Am7", "D7/F#", "G", "D/F#", "D7/F#", "Em", "C", "G/B", "Am7", "D7/F#", "G", "D/F#", "D7/F#", "Em", "C", "G/B", "Am7", "G/B"], lines: ["", "", "", "", "", ""] },
      { label: "Verse 3", chords: ["C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am7", "G/B", "C", "G/B", "Am"], lines: ["", "", "", "", "", ""] },
    ],
  },
  {
    id: "were-going-to-be-friends",
    title: "We're Going to Be Friends",
    artist: "The White Stripes",
    key: "G",
    capo: null,
    sections: [
      { label: "Intro", chords: ["G"], lines: [] },
      { label: "Verse 1", chords: ["G", "C", "G", "D", "C", "G", "D", "C", "G"], lines: ["", "", "", "", "", ""] },
      { label: "Verse 2", chords: ["G", "C", "G", "D", "C", "G", "D", "C", "G"], lines: ["", "", "", "", "", ""] },
      { label: "Verse 3", chords: ["G", "C", "G", "D", "C", "G", "D", "C", "G"], lines: ["", "", "", "", "", ""] },
      { label: "Verse 4", chords: ["G", "C", "G", "D", "C", "G", "D", "C", "G"], lines: ["", "", "", "", "", ""] },
      { label: "Bridge", chords: ["C", "G", "C", "G", "A", "C", "D"], lines: ["", "", "", "", ""] },
      { label: "Verse 5", chords: ["G", "C", "G", "D", "C", "G", "D", "C", "G6"], lines: ["", "", "", "", "", "", ""] },
    ],
  },
  {
    id: "bad-moon-rising",
    title: "Bad Moon Rising",
    artist: "Creedence Clearwater Revival",
    key: "D",
    capo: null,
    sections: [
      { label: "Intro", chords: ["D", "A", "G", "D"], lines: [] },
      { label: "Verse 1", chords: ["D", "A", "G", "D", "D", "A", "G", "D", "D", "A", "G", "D", "D", "A", "G", "D"], lines: ["", "", "", ""] },
      { label: "Chorus", chords: ["G", "D", "A", "G", "D"], lines: ["", "", ""] },
      { label: "Verse 2", chords: ["D", "A", "G", "D", "D", "A", "G", "D", "D", "A", "G", "D", "D", "A", "G", "D"], lines: ["", "", "", ""] },
      { label: "Chorus", chords: ["G", "D", "A", "G", "D"], lines: ["", "", ""] },
      { label: "Solo", chords: ["D", "A", "G", "D", "D", "A", "G", "D", "G", "D", "A", "G", "D"], lines: [] },
      { label: "Verse 3", chords: ["D", "A", "G", "D", "D", "A", "G", "D", "D", "A", "G", "D", "D", "A", "G", "D"], lines: ["", "", "", ""] },
      { label: "Chorus", chords: ["G", "D", "A", "G", "D"], lines: ["", "", ""] },
      { label: "Outro", chords: ["G", "D", "A", "G", "D"], lines: ["", "", ""] },
    ],
  },
  {
    id: "girl-from-the-north-country",
    title: "Girl from the North Country (Duet)",
    artist: "Bob Dylan",
    key: "G",
    capo: null,
    sections: [
      { label: "Intro", chords: ["G", "Bm", "C", "G", "G", "G", "G"], lines: [] },
      { label: "Verse 1", chords: ["G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G"], lines: ["", "", "", ""] },
      { label: "Verse 2", chords: ["G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G"], lines: ["", "", "", ""] },
      { label: "Verse 3", chords: ["G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G"], lines: ["", "", "", ""] },
      { label: "Verse 4", chords: ["G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G"], lines: ["", "", "", ""] },
      { label: "Interlude", chords: ["G", "Bm", "C", "G", "G", "Bm", "C", "G"], lines: [] },
      { label: "Verse 5", chords: ["G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G", "G", "Bm", "C", "G"], lines: ["", "", "", ""] },
      { label: "Outro", chords: ["Bm", "C", "G", "Bm", "C", "G", "Bm", "C", "G"], lines: ["", "", ""] },
    ],
  },
  {
    id: "youre-still-the-one",
    title: "You're Still the One",
    artist: "Shania Twain",
    key: "D",
    capo: null,
    sections: [
      { label: "Intro", chords: ["D", "D", "G", "A"], lines: [] },
      { label: "Verse 1", chords: ["D", "G", "A", "D", "G", "A", "D", "G", "A", "D", "G", "A", "D", "G", "A"], lines: ["", "", "", "", "", "", ""] },
      { label: "Chorus", chords: ["G", "D", "G", "Em", "A", "D", "G", "A", "G", "D", "G", "Em", "A", "D", "G", "A"], lines: ["", "", "", "", "", "", "", ""] },
      { label: "Verse 2", chords: ["D", "G", "A", "D", "G", "A", "D", "G", "A", "D", "G", "A", "D", "G", "A"], lines: ["", "", "", "", "", "", ""] },
      { label: "Chorus", chords: ["G", "D", "G", "Em", "A", "D", "G", "A", "G", "D", "G", "Em", "A", "D", "G", "A"], lines: ["", "", "", "", "", "", "", ""] },
      { label: "Solo", chords: ["D", "G", "A"], lines: [] },
      { label: "Chorus", chords: ["G", "D", "G", "Em", "A", "D", "G", "A", "G", "D", "G", "Em", "A", "D", "G", "A"], lines: ["", "", "", "", "", "", "", ""] },
      { label: "Tag", chords: ["D", "G", "A"], lines: ["", ""] },
    ],
  },
];
```

- [ ] **Step 2: Verify it loads without syntax errors**

Run: `node -e "const SONGS = require('./songs.js'); console.log(SONGS.length, SONGS.map(s => s.id));"` - this will fail because the file doesn't export anything yet; that's fine, this file is browser-only (no `module.exports` needed - nothing in Node touches `songs.js`, unlike `stories.js` which `scripts/generate-audio.js` requires). Instead verify with:

Run: `node -e "const fs = require('fs'); new Function(fs.readFileSync('songs.js', 'utf8')); console.log('parses OK');"`
Expected: `parses OK`

- [ ] **Step 3: Spot-check song count and section counts**

Run: `node -e "const fs = require('fs'); const src = fs.readFileSync('songs.js', 'utf8'); const SONGS = new Function(src + '; return SONGS;')(); console.log(SONGS.length, 'songs'); SONGS.forEach(s => console.log(s.id, '-', s.sections.length, 'sections'));"`
Expected: `9 songs` followed by each of the 9 ids with a section count matching the table above (Three Little Birds: 7, House of the Rising Sun: 9, Have You Ever Seen the Rain: 6, Be My Baby: 10, Landslide: 7, We're Going to Be Friends: 7, Bad Moon Rising: 9, Girl from the North Country: 8, You're Still the One: 8).

- [ ] **Step 4: Commit**

```bash
git add songs.js
git commit -m "Add songs.js with chord/section data for all 9 songs"
```

---

### Task 2: Priče / Pjesme tab switcher on the home screen

**Files:**
- Modify: `index.html:16-21` (home screen markup), inline `<script>` block
- Modify: `style.css` (generalize `.speed-toggle-group`/`.speed-option` naming - see below)

**Interfaces:**
- Consumes: `SONGS` (from Task 1), existing `STORIES` global.
- Produces: `showSection("stories" | "songs")` function; `#storyList` (existing) and new `#songList` containers; a new segmented control with ids `#storiesTabOption` / `#songsTabOption`.

The existing `.speed-toggle-group`/`.speed-option` classes in `style.css` are already generic (not named after "speed" in a way that breaks reuse) - use them as-is for this second segmented control, no renaming needed.

- [ ] **Step 1: Add the tab switcher and song-list container to the home screen markup**

In `index.html`, replace:

```html
  <div class="home" id="homeScreen">
    <div class="eyebrow">✨ Nikola</div>
    <h1>📖 Priče</h1>
    <div class="story-list" id="storyList"></div>
  </div>
```

with:

```html
  <div class="home" id="homeScreen">
    <div class="eyebrow">✨ Nikola</div>
    <h1 id="homeHeading">📖 Priče</h1>
    <div class="speed-toggle-group" id="sectionTabs">
      <div id="storiesTabOption" class="speed-option active">Priče</div>
      <div id="songsTabOption" class="speed-option">Pjesme</div>
    </div>
    <div class="story-list" id="storyList"></div>
    <div class="story-list" id="songList" hidden></div>
  </div>
```

- [ ] **Step 2: Add `<script src="songs.js">` next to the existing `stories.js` script tag**

In `index.html`, change:

```html
  <script src="stories.js"></script>
```

to:

```html
  <script src="stories.js"></script>
  <script src="songs.js"></script>
```

- [ ] **Step 3: Add song-list rendering and the tab-switch function to the inline script**

In `index.html`'s inline `<script>`, near `renderHome()`, add:

```js
const homeHeading = document.getElementById("homeHeading");
const songList = document.getElementById("songList");
const storiesTabOption = document.getElementById("storiesTabOption");
const songsTabOption = document.getElementById("songsTabOption");

function renderSongs() {
  songList.innerHTML = "";
  SONGS.forEach((s) => {
    const a = document.createElement("a");
    a.className = "story-card";
    a.href = `index.html?song=${s.id}`;
    a.innerHTML = `
      <div class="icon">🎸</div>
      <div class="text">
        <div class="hr">${s.title}</div>
        <div class="en">${s.artist}</div>
        <div class="meta">Key of ${s.key}${s.capo ? `, capo ${s.capo}` : ""}</div>
      </div>
    `;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState({ song: s.id }, "", `index.html?song=${s.id}`);
      selectSong(s.id);
    });
    songList.appendChild(a);
  });
}

function showSection(section) {
  const showingSongs = section === "songs";
  storiesTabOption.classList.toggle("active", !showingSongs);
  songsTabOption.classList.toggle("active", showingSongs);
  storyList.hidden = showingSongs;
  songList.hidden = !showingSongs;
  homeHeading.textContent = showingSongs ? "🎸 Pjesme" : "📖 Priče";
}

storiesTabOption.addEventListener("click", () => showSection("stories"));
songsTabOption.addEventListener("click", () => showSection("songs"));
```

- [ ] **Step 4: Call `renderSongs()` alongside the existing `renderHome()` call near the bottom of the script**

Change:

```js
    renderHome();
    syncFromUrl();
```

to:

```js
    renderHome();
    renderSongs();
    syncFromUrl();
```

(`selectSong` is defined in Task 3 - this step will leave `selectSong` undefined until Task 3 lands; that's expected for this task's intermediate state and gets resolved immediately by the next task, not left broken across a commit boundary because Task 3 is the very next task in the same session.)

- [ ] **Step 5: Sanity-check the script parses**

Run: `node -e "const fs = require('fs'); new Function(fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1].replace(/STORIES/g, 'globalThis.STORIES||[]').replace(/SONGS/g, 'globalThis.SONGS||[]')); console.log('parses OK');"`
Expected: `parses OK`. (A `selectSong is not defined` error would only surface at runtime when a song card is tapped, not at parse time - Task 3 defines it. Full click-through UAT, including confirming the tab switcher and song list actually render and swap correctly, is left to the user rather than performed here.)

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Add Price/Pjesme tab switcher and song list to the home screen"
```

---

### Task 3: Chord-preview screen

**Files:**
- Modify: `index.html` (new screen markup + script)

**Interfaces:**
- Consumes: `SONGS`, `showSection`, the existing `homeScreen`/`playerScreen` show/hide pattern, `history.pushState`/`popstate` handling in `syncFromUrl()`.
- Produces: `selectSong(id)` function; `#songPreviewScreen` container; `showSongPreview()`/`showHome()` (existing `showHome` gets extended, not replaced).

- [ ] **Step 1: Add the chord-preview screen markup**

In `index.html`, add this new screen div right after the closing `</div>` of `playerScreen` (before the `<audio>` tag):

```html
  <div class="player" id="songPreviewScreen" hidden>
    <div class="player-top">
      <a class="back-link" href="index.html" id="songPreviewBackLink">&lsaquo; Natrag</a>
    </div>
    <div class="song-preview-body">
      <div class="eyebrow" id="songPreviewArtist"></div>
      <h1 id="songPreviewTitle"></h1>
      <div class="song-preview-meta" id="songPreviewMeta"></div>
      <div class="song-preview-sections" id="songPreviewSections"></div>
      <button id="songPlayBtn" class="replay">🎸 Sviraj</button>
    </div>
  </div>
```

- [ ] **Step 2: Add the JS to populate and show this screen**

In `index.html`'s inline script, add:

```js
const songPreviewScreen = document.getElementById("songPreviewScreen");
const songPreviewArtist = document.getElementById("songPreviewArtist");
const songPreviewTitle = document.getElementById("songPreviewTitle");
const songPreviewMeta = document.getElementById("songPreviewMeta");
const songPreviewSections = document.getElementById("songPreviewSections");
const songPreviewBackLink = document.getElementById("songPreviewBackLink");
const songPlayBtn = document.getElementById("songPlayBtn");

let song = null;

function selectSong(id) {
  song = SONGS.find((s) => s.id === id) || SONGS[0];
  songPreviewArtist.textContent = song.artist;
  songPreviewTitle.textContent = song.title;
  songPreviewMeta.textContent = `Key of ${song.key}${song.capo ? `, capo ${song.capo}` : ""}`;
  songPreviewSections.innerHTML = song.sections
    .map((sec) => `
      <div class="song-section-row">
        <div class="song-section-label">${sec.label}</div>
        <div class="song-section-chords">${sec.chords.join(" · ")}</div>
      </div>
    `)
    .join("");
  homeScreen.hidden = true;
  playerScreen.hidden = true;
  songPreviewScreen.hidden = false;
}

songPreviewBackLink.addEventListener("click", (e) => {
  e.preventDefault();
  history.back();
});
```

- [ ] **Step 3: Extend `showHome()` to also hide the preview screen, and extend `syncFromUrl()` to recognize `?song=`**

Change:

```js
    function showHome() {
      clearTimeout(pendingTimer);
      audio.pause();
      story = null;
      playerScreen.hidden = true;
      homeScreen.hidden = false;
    }
```

to:

```js
    function showHome() {
      clearTimeout(pendingTimer);
      audio.pause();
      story = null;
      song = null;
      playerScreen.hidden = true;
      songPreviewScreen.hidden = true;
      homeScreen.hidden = false;
    }
```

Change:

```js
    function syncFromUrl() {
      const params = new URLSearchParams(location.search);
      const id = params.get("story");
      if (id && STORIES.some((s) => s.id === id)) {
        selectStory(id);
      } else {
        showHome();
      }
    }
```

to:

```js
    function syncFromUrl() {
      const params = new URLSearchParams(location.search);
      const storyId = params.get("story");
      const songId = params.get("song");
      if (storyId && STORIES.some((s) => s.id === storyId)) {
        selectStory(storyId);
      } else if (songId && SONGS.some((s) => s.id === songId)) {
        selectSong(songId);
      } else {
        showHome();
      }
    }
```

- [ ] **Step 4: Add preview-screen styling**

In `style.css`, add:

```css
.song-preview-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;
}

.song-preview-meta {
  font-size: 1rem;
  color: var(--label-secondary);
  margin-bottom: 1rem;
}

.song-preview-sections {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.song-section-row {
  background: var(--bg-elevated-1);
  border: 1px solid var(--separator);
  border-radius: 14px;
  padding: 0.6rem 0.9rem;
}

.song-section-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.song-section-chords {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--label-primary);
  font-family: var(--font-display);
}
```

- [ ] **Step 5: Sanity-check the script parses**

Run the same parse check as Task 2 Step 5.
Expected: `parses OK`. Click-through UAT (selecting "Three Little Birds" and confirming the preview screen shows the right artist/title/key and all 7 sections with correct chords, then back navigation) is left to the user.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css
git commit -m "Add chord-preview screen for songs"
```

---

### Task 4: Performance (scrolling) screen with the corner chord widget

**Files:**
- Modify: `index.html` (new screen markup + script)
- Modify: `style.css` (new screen styles)

**Interfaces:**
- Consumes: `song` (current song object, set by `selectSong` in Task 3), `songPlayBtn` click.
- Produces: `enterPerformance()`, `advanceSongLine(direction)`, a small state machine (`sectionIdx`, `lineIdx`, `songTimer`, `songPaused`, `scrollIntervalMs`).

- [ ] **Step 1: Add the performance-screen markup**

Add this new screen div in `index.html`, right after `songPreviewScreen`'s closing `</div>`:

```html
  <div class="player" id="songPlayScreen" hidden>
    <div class="chord-widget" id="chordWidget"></div>
    <div class="player-top">
      <a class="back-link" href="index.html" id="songPlayBackLink">&lsaquo; Natrag</a>
    </div>
    <div class="line-area" id="songLineArea">
      <div class="line-hr" id="songLineText"></div>
    </div>
    <div class="controls" id="songControls">
      <button id="songPrevBtn" class="icon-btn" aria-label="Prethodni dio">&lsaquo;</button>
      <button id="speedDownBtn" class="icon-btn" aria-label="Sporije">&minus;</button>
      <button id="songPauseBtn" class="icon-btn" aria-label="Pauza">&#9208;</button>
      <button id="speedUpBtn" class="icon-btn" aria-label="Brže">&plus;</button>
      <button id="songNextBtn" class="icon-btn" aria-label="Sljedeći dio">&rsaquo;</button>
    </div>
  </div>
```

- [ ] **Step 2: Add the performance-view state and logic to the inline script**

```js
const songPlayScreen = document.getElementById("songPlayScreen");
const chordWidget = document.getElementById("chordWidget");
const songLineText = document.getElementById("songLineText");
const songPauseBtn = document.getElementById("songPauseBtn");
const songPlayBackLink = document.getElementById("songPlayBackLink");

let sectionIdx = 0;
let lineIdx = 0;
let songTimer = null;
let songPaused = false;
let scrollIntervalMs = 4000;
const MIN_INTERVAL_MS = 1500;
const MAX_INTERVAL_MS = 10000;

function currentSongLines() {
  const section = song.sections[sectionIdx];
  return section.lines.length > 0 ? section.lines : [""];
}

function renderSongLine() {
  const section = song.sections[sectionIdx];
  chordWidget.textContent = `${section.label}: ${section.chords.join(" · ")}`;
  songLineText.textContent = currentSongLines()[lineIdx];
}

function scheduleSongAdvance() {
  clearTimeout(songTimer);
  songTimer = setTimeout(() => advanceSongLine("forward"), scrollIntervalMs);
}

function advanceSongLine(direction) {
  const lines = currentSongLines();
  if (direction === "forward") {
    if (lineIdx < lines.length - 1) {
      lineIdx++;
    } else if (sectionIdx < song.sections.length - 1) {
      sectionIdx++;
      lineIdx = 0;
    } else {
      sectionIdx = 0;
      lineIdx = 0;
    }
  } else {
    if (lineIdx > 0) {
      lineIdx--;
    } else if (sectionIdx > 0) {
      sectionIdx--;
      lineIdx = currentSongLines().length - 1;
    }
  }
  renderSongLine();
  if (!songPaused) scheduleSongAdvance();
}

function enterPerformance() {
  sectionIdx = 0;
  lineIdx = 0;
  songPaused = false;
  songPauseBtn.textContent = "⏸";
  homeScreen.hidden = true;
  songPreviewScreen.hidden = true;
  songPlayScreen.hidden = false;
  renderSongLine();
  scheduleSongAdvance();
}

songPlayBtn.addEventListener("click", enterPerformance);

document.getElementById("songPrevBtn").addEventListener("click", () => {
  clearTimeout(songTimer);
  advanceSongLine("backward");
});
document.getElementById("songNextBtn").addEventListener("click", () => {
  clearTimeout(songTimer);
  advanceSongLine("forward");
});

songPauseBtn.addEventListener("click", () => {
  songPaused = !songPaused;
  songPauseBtn.textContent = songPaused ? "▶" : "⏸";
  if (songPaused) {
    clearTimeout(songTimer);
  } else {
    scheduleSongAdvance();
  }
});

document.getElementById("speedUpBtn").addEventListener("click", () => {
  scrollIntervalMs = Math.max(MIN_INTERVAL_MS, scrollIntervalMs - 500);
});
document.getElementById("speedDownBtn").addEventListener("click", () => {
  scrollIntervalMs = Math.min(MAX_INTERVAL_MS, scrollIntervalMs + 500);
});

songPlayBackLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearTimeout(songTimer);
  history.back();
});
```

- [ ] **Step 3: Make `showHome()` also hide this screen and stop its timer**

Change (from Task 3's version):

```js
    function showHome() {
      clearTimeout(pendingTimer);
      audio.pause();
      story = null;
      song = null;
      playerScreen.hidden = true;
      songPreviewScreen.hidden = true;
      homeScreen.hidden = false;
    }
```

to:

```js
    function showHome() {
      clearTimeout(pendingTimer);
      clearTimeout(songTimer);
      audio.pause();
      story = null;
      song = null;
      playerScreen.hidden = true;
      songPreviewScreen.hidden = true;
      songPlayScreen.hidden = true;
      homeScreen.hidden = false;
    }
```

- [ ] **Step 4: Add performance-screen styling**

In `style.css`, add:

```css
.chord-widget {
  position: fixed;
  top: calc(0.9rem + env(safe-area-inset-top));
  right: calc(1rem + env(safe-area-inset-right));
  background: var(--bg-elevated-2);
  color: var(--accent-on-dim);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  z-index: 10;
  max-width: 60vw;
  text-align: right;
}
```

- [ ] **Step 5: Sanity-check the script parses**

Run the same parse check as Task 2 Step 5.
Expected: `parses OK`. Click-through UAT (corner widget text/updates per section, next/prev-section navigation, pause/resume, speed +/-, back navigation) is left to the user.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css
git commit -m "Add song performance view with auto-scroll and corner chord widget"
```

---

## Final Verification (after all tasks)

- [ ] Confirm no leftover references to undefined functions via the parse checks in each task (a real interpreter never touches this file, so `grep` for every new function name used and confirm it's defined exactly once).
- [ ] `git log --oneline -6` shows the 4 commits from this plan on top of the existing history.
- [ ] Full click-through UAT (Home -> Pjesme tab -> each of the 9 songs' chord-preview screens, spot-checked against `songs/chord-charts/*.pdf` -> Sviraj -> performance view -> back to home; confirm Priče is unaffected) is the user's to run, not part of this plan's execution.
