// Local-date helpers for Planner document keys ("YYYY-MM-DD").
// Always uses the browser's local calendar day — never toISOString(), which
// is UTC and would give the wrong day in Australia before ~9:30am.

const pad = (n) => String(n).padStart(2, '0')

export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "2026-10-06" -> local Date at midnight
export function fromDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "2026-10-06" -> "Tuesday, 6 October 2026"
export function formatLongDate(dateKey) {
  const date = fromDateKey(dateKey)
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'long' })
  const rest = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${weekday}, ${rest}`
}

// "2026-11-30" -> "30 Nov 2026"
export function formatShortDate(dateKey) {
  return fromDateKey(dateKey).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Whole calendar days from one date key to another (negative if `to` is
// earlier). Compares the calendar dates via Date.UTC, so daylight-saving
// changes (23- or 25-hour days) can't produce fractional or off-by-one results.
export function daysBetween(fromKey, toKey) {
  const utc = (key) => {
    const [y, m, d] = key.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(toKey) - utc(fromKey)) / 86400000)
}

// 55 -> "55 days remaining", 0 -> "Today", -3 -> "3 days ago"
export function countdownText(days) {
  if (days === 0) return 'Today'
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} remaining`
  const ago = -days
  return `${ago} day${ago === 1 ? '' : 's'} ago`
}

// Previous / next day, e.g. addDays('2026-10-31', 1) -> '2026-11-01'
export function addDays(dateKey, days) {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}
