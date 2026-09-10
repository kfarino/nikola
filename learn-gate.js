// Holds last week's story until that week's quiz is passed.
// Shared by the app and scripts/test-quiz-gate.js.

function slotKey(id, date) {
  return `${id}:${date}`;
}

function storyWeek(s, fallbackDate) {
  return s.weekDate || fallbackDate;
}

function displayedStoriesFor(stories, previousStories, previousDate, passed) {
  if (!previousDate || !previousStories || !previousStories.length) return stories;
  return stories.map((fresh) => {
    const old = previousStories.find((s) => s.id === fresh.id);
    if (old && !passed[slotKey(old.id, storyWeek(old, previousDate))]) return old;
    return fresh;
  });
}

if (typeof module !== "undefined") {
  module.exports = { slotKey, storyWeek, displayedStoriesFor };
}
