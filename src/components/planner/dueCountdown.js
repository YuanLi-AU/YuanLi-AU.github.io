import { useSyncExternalStore } from 'react'
import { daysBetween, toDateKey } from '../../lib/dates.js'

// Countdown under each Due, worked out in the browser only (no Firebase).
//
// One shared clock for the whole page, in whole minutes: a single timer
// fires at the start of every minute (never one per task), and the clock
// is read again at once when the Planner comes back to the foreground, so
// a phone woken from sleep never shows an old value. No seconds.

const MINUTE = 60000
let now = Math.floor(Date.now() / MINUTE) * MINUTE
let timer = null
const listeners = new Set()

function tick() {
  const next = Math.floor(Date.now() / MINUTE) * MINUTE
  if (next === now) return
  now = next
  listeners.forEach((listener) => listener())
}

function schedule() {
  timer = setTimeout(
    () => {
      tick()
      schedule()
    },
    MINUTE - (Date.now() % MINUTE) + 20,
  )
}

const onVisible = () => document.visibilityState === 'visible' && tick()

function subscribe(listener) {
  listeners.add(listener)
  if (listeners.size === 1) {
    tick()
    schedule()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', tick)
    window.addEventListener('pageshow', tick)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', tick)
      window.removeEventListener('pageshow', tick)
    }
  }
}

// The current time (ms), whole minutes.
export function useMinuteClock() {
  return useSyncExternalStore(subscribe, () => now)
}

function hoursMinutes(total) {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} 分`
  if (m === 0) return `${h} 小时`
  return `${h} 小时 ${m} 分`
}

// Each countdown is { text, tone }; the tone colours its numbers (and the
// word 逾期 / 已到期 / 今天到期) — the other words stay grey (TaskRow / CSS):
//   'over'   (red)    — due now or overdue
//   'soon'   (orange) — Daily within 1 hour; Mid / Long due today
//   'normal' (blue numbers) — everything else
const SOON_MINUTES = 60

// Daily: due time "HH:MM" today (local time), to the minute.
//   "剩余 3 小时 20 分" · "已到期" (that minute) · "逾期 1 小时 5 分"
export function timeLeft(dueTime, nowMs) {
  const [h, m] = dueTime.split(':').map(Number)
  const at = new Date(nowMs)
  at.setHours(h, m, 0, 0) // today's local wall-clock time, DST-correct
  const minutes = Math.round((at.getTime() - nowMs) / MINUTE)
  if (minutes > 0) {
    return { text: `剩余 ${hoursMinutes(minutes)}`, tone: minutes <= SOON_MINUTES ? 'soon' : 'normal' }
  }
  if (minutes === 0) return { text: '已到期', tone: 'over' }
  return { text: `逾期 ${hoursMinutes(-minutes)}`, tone: 'over' }
}

// Mid / Long: Due date "YYYY-MM-DD", in whole local calendar days
// (daysBetween compares calendar dates, so time zones / DST can't shift it).
//   "剩余 22 天" · "今天到期" · "逾期 2 天"
export function daysLeft(dateKey, nowMs) {
  const days = daysBetween(toDateKey(new Date(nowMs)), dateKey)
  if (days > 0) return { text: `剩余 ${days} 天`, tone: 'normal' }
  if (days === 0) return { text: '今天到期', tone: 'soon' }
  return { text: `逾期 ${-days} 天`, tone: 'over' }
}
