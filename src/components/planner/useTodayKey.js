import { useEffect, useRef, useState } from 'react'
import { toDateKey } from '../../lib/dates.js'

// Calls `onDayChange(newKey)` when the local calendar day changes while the
// Planner is open — checked every minute and whenever the app comes back to
// the foreground, so a Planner left open overnight moves on by itself.
export function useDayChange(onDayChange) {
  const latest = useRef(onDayChange)
  useEffect(() => {
    latest.current = onDayChange
  })

  useEffect(() => {
    let seen = toDateKey()
    const check = () => {
      const now = toDateKey()
      if (now === seen) return
      seen = now
      latest.current(now)
    }
    const onVisible = () => document.visibilityState === 'visible' && check()
    const timer = setInterval(check, 60000)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}

// Today's local date key ("YYYY-MM-DD"), kept current (see useDayChange).
export default function useTodayKey() {
  const [todayKey, setTodayKey] = useState(() => toDateKey())
  useDayChange(setTodayKey)
  return todayKey
}
