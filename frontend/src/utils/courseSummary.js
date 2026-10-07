// The backend allows a summary of up to 160 characters.
const SUMMARY_LENGTH = 160

// Makes a course summary from its description. Short descriptions are used as they are.
// Longer ones are cut at the last whole word, leaving room for the "…".
export function makeCourseSummary(description) {
  const text = description.trim().replace(/\s+/g, ' ')
  if (text.length <= SUMMARY_LENGTH) return text

  const lastSpace = text.lastIndexOf(' ', SUMMARY_LENGTH - 1)
  // A first word longer than the limit has no space to cut at.
  const start = lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, SUMMARY_LENGTH - 1)
  return `${start.replace(/[\s,;:.–—-]+$/, '')}…`
}

// True when the summary is just the start of the description, so showing both would repeat it.
export function summaryRepeatsDescription(summary, description) {
  const normalize = (text) => (text ?? '').trim().replace(/\s+/g, ' ')
  const start = normalize(summary).replace(/…$/, '').trimEnd()
  return normalize(description).startsWith(start)
}
