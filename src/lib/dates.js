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

// Previous / next day, e.g. addDays('2026-10-31', 1) -> '2026-11-01'
export function addDays(dateKey, days) {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

// Time left until `targetKey` begins (00:00 local — the moment the countdown
// turns to "Today"), in whole minutes split into days / hours / minutes.
// Whole calendar days come from daysBetween (DST-safe); only the time left
// in the current day is read from the wall clock, so a daylight-saving
// change can't shift the result by an hour.
// Returns { days, hours, minutes } while the date is ahead, otherwise
// { daysAgo } (0 = today).
export function countdownParts(targetKey, now = new Date()) {
  const calendarDays = daysBetween(toDateKey(now), targetKey)
  if (calendarDays <= 0) return { daysAgo: -calendarDays }
  const secondsToday =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000
  const minutes = Math.floor((calendarDays * 86400 - secondsToday) / 60)
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  }
}

// Chinese lunar month + day in Simplified Chinese, e.g. "农历八月廿六"
// (leap months come out as "闰六月…"). Uses the browser's built-in Chinese
// calendar (Intl), so no extra library; returns "" if it isn't available.
// The date is formatted as noon UTC in UTC, so the result depends only on
// the calendar date — never on the device's time zone.
const DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
let lunarFormat

function lunarDay(day) {
  if (day <= 10) return `初${DIGITS[day]}`
  if (day < 20) return `十${DIGITS[day - 10]}`
  if (day === 20) return '二十'
  if (day < 30) return `廿${DIGITS[day - 20]}`
  return '三十'
}

export function lunarDate(dateKey) {
  try {
    lunarFormat ??= new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    if (lunarFormat.resolvedOptions().calendar !== 'chinese') return ''
    const [y, m, d] = dateKey.split('-').map(Number)
    const parts = lunarFormat.formatToParts(new Date(Date.UTC(y, m - 1, d, 12)))
    const month = parts.find((p) => p.type === 'month')?.value
    const day = Number(parts.find((p) => p.type === 'day')?.value)
    if (!month || !(day >= 1 && day <= 30)) return ''
    return `农历${month}${lunarDay(day)}`
  } catch {
    return ''
  }
}
