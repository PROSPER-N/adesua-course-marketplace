// Month names are written out, because the browser's short names differ ("Sep" or "Sept").
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "2026-09-28T10:00:00.000Z" -> "28 Sep 2026"
export function formatDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return ''

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}
