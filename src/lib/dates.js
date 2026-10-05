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

// Previous / next day, e.g. addDays('2026-10-31', 1) -> '2026-11-01'
export function addDays(dateKey, days) {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}
