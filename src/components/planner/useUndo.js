import { createContext, useContext, useRef, useState } from 'react'

// One-level Undo for the Planner: only the most recent undoable action.
// Session-only UI state (gone on refresh / Lock); nothing is stored in
// Firestore. The top ↶ button and the "Undo" link in a list's message both
// call the same undo().
//
// An action is registered only after it has succeeded, as
//   { label, targetId, run }
// where run() performs the undo through the same safe paths as the rest of
// the Planner (Restore transactions, or the list's auto-save) and returns a
// short message. A newer action replaces the older one; a successful undo
// clears it; a failed undo keeps it so it can be retried.
// Undo and row transactions (complete / move / delete) never overlap: while
// a row transaction runs (hold) Undo waits, and while an undo runs
// (isRunning) row actions don't start.
const UndoContext = createContext(null)

export const UndoProvider = UndoContext.Provider

export function useUndoStore() {
  const [entry, setEntry] = useState(null)
  const [busy, setBusy] = useState(false)
  const [held, setHeld] = useState(0) // row transactions in progress
  const current = useRef(null)
  const running = useRef(false)
  const holds = useRef(0)

  function hold(on) {
    holds.current += on ? 1 : -1
    setHeld(holds.current)
  }

  const isRunning = () => running.current

  function set(next) {
    current.current = next
    setEntry(next)
  }

  // Returns the new entry's id (used by message "Undo" links).
  function register(label, targetId, run) {
    const next = { id: crypto.randomUUID(), label, targetId, run }
    set(next)
    return next.id
  }

  // Drop the pending undo if it is about this row (e.g. it was deleted
  // permanently or restored by hand, so there is nothing left to undo).
  function forget(targetId) {
    if (current.current?.targetId === targetId) set(null)
  }

  async function undo() {
    const target = current.current
    if (!target || running.current || holds.current > 0) return
    running.current = true
    setBusy(true)
    try {
      await target.run()
      if (current.current === target) set(null)
    } catch {
      // keep it: the action's own message explains, and it can be retried
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  return { entry, busy: busy || held > 0, register, forget, undo, hold, isRunning }
}

export function useUndo() {
  return useContext(UndoContext)
}
