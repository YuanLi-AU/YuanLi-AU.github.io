import { useEffect, useRef, useState } from 'react'
import { isDueBy, moveDueToDaily, subscribePlan } from '../../lib/plannerData.js'
import { restoreWithSync } from './useSyncedItems.js'

const RETRY_DELAY = 30000 // ms before a failed move is tried again by itself
const PLAN_IDS = ['midTerm', 'longTerm']

// Tells the Mid/Long-term lists how many of their rows just moved to Daily.
const listeners = new Set()
export function onDueMoved(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Moves Mid-term / Long-term rows whose Due date is today or earlier to the
// end of the Daily list (moveDueToDaily — one idempotent transaction).
//
// When it runs: whenever the stored Mid/Long-term lists contain a due row —
// so on opening the Planner (first data), after any change to those lists
// (on this or another device, including setting a Due date), when the
// calendar day changes while the Planner stays open (`todayKey`), and after
// a failure (every RETRY_DELAY and when the browser comes back online).
// Several days unopened: everything overdue moves on the next open.
//
// It runs like a Restore (useSyncedItems restoreWithSync): pending edits in
// every list are saved first and list writes wait meanwhile; every later
// save merges with the stored lists, so a moved row is never written back
// to its old list, and Daily rows added on another device are kept.
export default function useDueMove(todayKey, flushers) {
  const [plans, setPlans] = useState({}) // planId → stored rows
  const [attempt, setAttempt] = useState(0) // bumps to retry after a failure
  const running = useRef(false)
  const again = useRef(false)

  useEffect(() => {
    const stops = PLAN_IDS.map((planId) =>
      subscribePlan(
        planId,
        (items) => setPlans((prev) => ({ ...prev, [planId]: items })),
        () => {}, // the list itself shows load errors
      ),
    )
    return () => stops.forEach((stop) => stop())
  }, [])

  const hasDue = PLAN_IDS.some((planId) =>
    (plans[planId] ?? []).some((item) => isDueBy(item.targetDate, todayKey)),
  )

  useEffect(() => {
    if (!hasDue) return undefined
    let retry = null

    async function run() {
      if (running.current) {
        again.current = true // a move is running: check once more afterwards
        return
      }
      running.current = true
      try {
        const result = await restoreWithSync(flushers, async () => ({
          moved: await moveDueToDaily(todayKey),
        }))
        const counts = {}
        for (const row of result.moved) {
          counts[row.movedFrom] = (counts[row.movedFrom] ?? 0) + 1
        }
        if (result.moved.length > 0) listeners.forEach((listener) => listener(counts))
      } catch {
        // Nothing was moved (offline etc.); the rows stay where they are.
        retry = setTimeout(() => setAttempt((n) => n + 1), RETRY_DELAY)
      } finally {
        running.current = false
        if (again.current) {
          again.current = false
          setAttempt((n) => n + 1)
        }
      }
    }

    run()
    const online = () => setAttempt((n) => n + 1)
    window.addEventListener('online', online)
    return () => {
      clearTimeout(retry)
      window.removeEventListener('online', online)
    }
  }, [hasDue, todayKey, plans, attempt, flushers])
}
