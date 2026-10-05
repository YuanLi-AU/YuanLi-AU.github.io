import { useEffect, useRef, useState } from 'react'

const SAVE_DELAY = 700 // ms after the last edit before writing to Firestore

// ---------- Restore coordination (shared by all tables) ----------
// A Restore transaction writes a row straight into a table's Firestore doc.
// Every write from these tables replaces the whole list, so a write built
// from a local list that doesn't contain the restored row would erase it.
// To prevent that:
//   1. pauseSaves(): while the restore transaction runs, auto-saves and
//      row transactions wait instead of writing a stale list.
//   2. adoptRestoredRow(): after it succeeds (and before saves resume), the
//      restored row is added to the matching table's local list as an edit,
//      so every later write includes it.
let savesPaused = null // Promise while a restore transaction is running
const adopters = new Set()

export function pauseSaves() {
  let release
  savesPaused = new Promise((resolve) => {
    release = resolve
  })
  return () => {
    savesPaused = null
    release()
  }
}

async function waitForSaves() {
  while (savesPaused) await savesPaused
}

export function adoptRestoredRow(key, row) {
  adopters.forEach((adopt) => adopt(key, row))
}

// A list of rows kept in sync with one Firestore document (a day's plan, or
// the mid/long-term plan). Shared by all planner tables.
//
// How saving works:
// - Every edit updates the screen immediately and marks the list "dirty".
// - A debounced timer writes the whole list once typing pauses.
// - Firestore snapshots only ever update the screen; they never trigger a
//   save, so there is no snapshot → save → snapshot loop.
// - While the list has unsaved edits, incoming snapshots are ignored so they
//   can't overwrite what is being typed (or wipe it on a network hiccup).
//
// `key` identifies the document (e.g. a date). `subscribe(key, onItems, onError)`
// and `save(key, items)` come from plannerData.js. `flushers` (a Set) lets the
// Lock button save every table before signing out.
export default function useSyncedItems(key, subscribe, save, flushers) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  // Latest values for timers and cleanup (which outlive a single render).
  const latest = useRef({ key, items })
  const timer = useRef(null)
  const dirtyKey = useRef(null) // key with edits not yet confirmed saved
  const version = useRef(0) // bumps on every edit
  const waiting = useRef(new Set()) // lists captured while saves are paused

  // Write any pending edits now. Uses refs only, so it is safe to call from
  // cleanup, from key changes and from the Lock button.
  async function flush() {
    clearTimeout(timer.current)
    timer.current = null
    if (!dirtyKey.current) return
    let target = latest.current
    if (savesPaused) {
      // A restore is running: wait, then write the newest list for this key
      // (it includes the restored row by then). A list captured for a key we
      // have since left stays in `waiting`, where adopt() can patch it.
      waiting.current.add(target)
      await waitForSaves()
      waiting.current.delete(target)
      if (latest.current.key === target.key) target = latest.current
    }
    const { key: savingKey, items: toSave } = target
    const savedVersion = version.current
    setSaveState('saving')
    try {
      await save(savingKey, toSave)
      if (savedVersion === version.current) {
        dirtyKey.current = null
        setSaveState('saved')
      }
    } catch {
      // Keep the edits on screen (still dirty); the user can retry.
      setSaveState('error')
    }
  }

  // A row restored from history into `rowKey`: add it to this table's lists
  // if missing. Treated as an edit (dirty + auto-save), so stale snapshots
  // are ignored and every later write keeps it. Never adds a duplicate.
  function adopt(rowKey, row) {
    const missing = (list) => !list.some((item) => item.id === row.id)
    for (const target of waiting.current) {
      if (target.key === rowKey && missing(target.items)) target.items = [...target.items, row]
    }
    if (latest.current.key === rowKey && missing(latest.current.items)) {
      update([...latest.current.items, row], rowKey)
    }
  }

  // Keep the newest flush available to the Lock button and to unmount, and
  // register for restored rows.
  const latestFlush = useRef(flush)
  useEffect(() => {
    latestFlush.current = flush
    adopters.add(adopt)
    if (flushers) flushers.add(flush)
    return () => {
      adopters.delete(adopt)
      if (flushers) flushers.delete(flush)
    }
  })

  // Live data for the current key. Unsubscribes when the key changes or the
  // table unmounts (e.g. Lock).
  useEffect(
    () =>
      subscribe(
        key,
        (remote) => {
          if (dirtyKey.current === key) return // keep local edits
          latest.current = { key, items: remote }
          setItems(remote)
          setLoading(false)
          setLoadError(false)
        },
        () => {
          setLoading(false)
          setLoadError(true)
        },
      ),
    [key, subscribe],
  )

  // Save anything pending when leaving.
  useEffect(() => () => latestFlush.current(), [])

  function update(nextItems, forKey = key) {
    latest.current = { key: forKey, items: nextItems }
    dirtyKey.current = forKey
    version.current += 1
    setItems(nextItems)
    setSaveState('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, SAVE_DELAY)
  }

  // Before switching to another key: save the current one, then clear.
  function switchTo(nextKey) {
    flush()
    latest.current = { key: nextKey, items: [] }
    setItems([])
    setLoading(true)
  }

  // Removes one row via a Firestore transaction `run(item, remaining)` that
  // also writes this list without the row (move to tomorrow / complete).
  // The row only leaves the screen after the transaction succeeds; if it
  // fails nothing was written and the row stays. Returns the transaction's
  // result, or throws.
  async function removeVia(id, run) {
    // Don't build "remaining" from a list that may be missing a row a running
    // restore is about to add.
    await waitForSaves()
    const item = latest.current.items.find((row) => row.id === id)
    if (!item) return undefined

    // The transaction saves this list (including pending edits), so cancel
    // the pending auto-save to avoid a stale write racing it.
    clearTimeout(timer.current)
    timer.current = null
    const startVersion = version.current
    const runKey = latest.current.key
    const remaining = latest.current.items.filter((row) => row.id !== id)

    try {
      const result = await run(item, remaining)
      if (version.current === startVersion) {
        // Nothing edited meanwhile: the transaction saved exactly this list.
        latest.current = { key: runKey, items: remaining }
        dirtyKey.current = null
        setItems(remaining)
        setSaveState('saved')
      } else {
        // Edited during the transaction: drop the row from the newer list.
        update(latest.current.items.filter((row) => row.id !== id))
      }
      return result
    } catch (err) {
      // Nothing was written; the row stays. Re-arm any pending auto-save.
      if (dirtyKey.current === runKey) timer.current = setTimeout(flush, SAVE_DELAY)
      throw err
    }
  }

  return { items, loading, loadError, saveState, latest, flush, update, switchTo, removeVia }
}
