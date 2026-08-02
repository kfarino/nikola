# Songs section design

## Context

The app currently has one section (Priče - bedtime stories). The user wants to add a Songs section for practicing guitar songs they play and sing to their son: pick a song, glance at the chord progression, then follow along with scrolling lyrics+chords while their hands are on the guitar.

Nine songs' chord charts (PDFs) have been supplied and saved to `songs/chord-charts/`: Three Little Birds, House of the Rising Sun, Have You Ever Seen the Rain, Be My Baby, Landslide, We're Going to Be Friends, Bad Moon Rising, Girl from the North Country (Duet), You're Still the One.

**Copyright constraint (already agreed with the user):** chord progressions are fine to encode directly from the supplied PDFs - chords/structure aren't protected the way lyric text is. Actual lyric text is NOT included in this project; the user will type it in themselves later, one song at a time. Every song's data ships with the lyric `text` fields blank (`""`) - this spec only wires up the chords and structure.

## Approach

Extend the existing single-page app (`index.html`) rather than adding a separate page. Songs has no need for the audio-autoplay-on-tap gesture trick that forced Stories into one page, but keeping the same show/hide-screen + `history.pushState` pattern keeps the app consistent as more sections (Knjige, Učenje) get added later.

### 1. `songs.js` - data file (parallel to `stories.js`)

Most of these songs hold a steady chord loop through an entire section rather than a different chord per lyric line, and the performance view is lyrics-first (chords are just the corner reference) - so chords and lyric lines are two separate arrays per section, not paired line-by-line:

```js
const SONGS = [
  {
    id: "three-little-birds",
    title: "Three Little Birds",
    artist: "Bob Marley",
    key: "A",
    capo: null,
    sections: [
      { label: "Intro", chords: ["A"], lines: [""] },
      { label: "Chorus", chords: ["A", "D", "A"], lines: ["", "", "", ""] },
      { label: "Verse 1", chords: ["A", "E", "A", "D"], lines: ["", "", "", "", "", "", ""] },
      // ...Chorus, Verse 2, Outro
    ],
  },
  // ...8 more songs, same shape, chords/section structure transcribed from songs/chord-charts/*.pdf
];
if (typeof module !== "undefined") module.exports = SONGS;
```

`chords` is that section's repeating progression (drives the corner widget). `lines` is one blank string per lyric line in that section - just a count placeholder for now, filled in by the user later. This is deliberately simpler than tying a chord to every line, matching how these songs are actually played (a loop under the whole section, not a chord change on every line).

### 2. Home screen: Priče / Pjesme tab switcher

Add a segmented control under the `h1` (reusing `.speed-toggle-group`/`.speed-option` styling, generalized since it's no longer speed-specific), toggling which list renders in the space currently occupied by `.story-list`. Pjesme cards use the same `.story-card` layout (icon chip + title/subtitle), with a generic music-note emoji icon, artist as the subtitle line, and key (e.g. "Key of A") as the meta line instead of a line count.

### 3. Song screens

**Chord preview** (shown immediately on selecting a song, via the same `history.pushState` + show/hide pattern as `selectStory`): title, artist, key/capo, then each section listed with its chord progression collapsed to a readable sequence (e.g. "Verse 1: A · E · A · D · A · E · D · A"). A "Sviraj" button proceeds to the performance view.

**Performance view**: full-screen scroll through the song's lines.
- Main content: the current line's lyric text in the same big `.line-hr`-style treatment as the story player (~3.2rem, matched for the same 30in reading distance) - blank for now until lyric text is filled in, but the styling/layout is real and ready.
- **Chord corner widget**: a small fixed pill (top-right, reusing the compact badge styling already used elsewhere) showing the *current section's* chord progression (e.g. "A · E · A · D"), always visible regardless of scroll position, updating automatically when the active section changes.
- Controls: prev/next-section jump buttons (mirroring the story player's icon buttons), a speed control for auto-scroll rate, and a pause/resume toggle (same concept as the story player's pause button - freezes the auto-scroll).
- Navigation state (current song, current section/line index) is tracked the same way `idx`/`playingHalf` are tracked for Stories - a small explicit state machine, not scroll-position math.

### 4. Styling

No new design-system tokens needed - reuses `--font-display`, the label-opacity hierarchy, `.icon-btn`, `.speed-option`-style segmented controls, and `.line-hr`/`.line-en` sizing already established for Stories. This keeps Songs visually part of the same app rather than a bolted-on feature.

## Verification

- Manually check each of the 9 songs' `sections`/chord data against its source PDF in `songs/chord-charts/` for transcription accuracy.
- Confirm the chord-preview screen renders all sections/chords correctly for at least 2-3 songs of varying complexity (e.g. Three Little Birds' simple 3-chord structure vs. Landslide's slash chords).
- Confirm the performance view's corner chord widget updates when jumping between sections, and that pause/resume and the speed control behave sensibly with no lyric text yet present (blank lines should not break scrolling/layout).
- This is a UI feature with no audio/API cost - verification is code review + manual click-through, no ElevenLabs calls involved.
