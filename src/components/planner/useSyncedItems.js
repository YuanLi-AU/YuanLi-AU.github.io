import { useEffect, useRef, useState } from 'react'
import { mergeList } from '../../lib/plannerData.js'

const SAVE_DELAY = 700 // ms after the last edit before writing to Firestore
const RETRY_DELAY = 15000 // ms before a failed save is tried again by itself

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
let pauses = 0 // nested pauses (e.g. the migration and a restore at once)
let releasePause = null
const adopters = new Set()

// Saves resume only when the LAST overlapping pause has ended.
export function pauseSaves() {
  if (pauses === 0) {
    savesPaused = new Promise((resolve) => {
      releasePause = resolve
    })
  }
  pauses += 1
  let done = false
  return () => {
    if (done) return
    done = true
    pauses -= 1
    if (pauses === 0) {
      savesPaused = null
      releasePause()
    }
  }
}

async function waitForSaves() {
  while (savesPaused) await savesPaused
}

export function adoptRestoredRow(key, row) {
  adopters.forEach((adopt) => adopt(key, row))
}

// Runs a restore transaction (history ↩ Restore, Recycle Bin Restore, the
// one-time Daily migration) safely:
//  1. save pending edits in every table;
//  2. pause table writes while the transaction runs, so no stale list can be
//     written meanwhile;
//  3. on success, hand the restored row to its table before writes resume,
//     so later auto-saves include it.
// `run()` returns { destination, key, row } (or several `rows`) from
// plannerData.js.
export async function restoreWithSync(flushers, run) {
  if (flushers) await Promise.all([...flushers].map((flush) => flush()))
  const resume = pauseSaves()
  try {
    const result = await run()
    if (result.row) adoptRestoredRow(result.key, result.row)
    for (const row of result.rows ?? []) adoptRestoredRow(result.key, row) // migration: appended in order
    return result
  } finally {
    resume()
  }
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
// - Each save is merged with the stored list (plannerData mergeList): rows
//   another device (or the due-date move) added or removed meanwhile are
//   respected. `base` is the stored list the local edits started from.
//   Saves of one list run one after another, never at the same time.
// - A failed save keeps the edits and is retried after RETRY_DELAY, when the
//   browser comes back online, or by the Retry button.
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
  const loadedKey = useRef(null) // key whose Firestore data this list has received
  const base = useRef([]) // stored list the local edits started from
  const chain = useRef(Promise.resolve()) // the save / row transaction running now

  // Runs `task` after the save or row transaction already running, so two
  // writes of this list never overlap (each merges against the one before).
  function serial(task) {
    const run = chain.current.then(task)
    chain.current = run.catch(() => {})
    return run
  }

  // Write any pending edits now. Uses refs only, so it is safe to call from
  // cleanup, from key changes and from the Lock button.
  function flush() {
    clearTimeout(timer.current)
    timer.current = null
    return serial(write)
  }

  async function write() {
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
      const written = await save(savingKey, toSave, base.current)
      settle(savingKey, written, toSave, savedVersion)
      if (savedVersion === version.current) setSaveState('saved')
    } catch {
      // Keep the edits on screen (still dirty); try again later.
      setSaveState('error')
      if (!timer.current && dirtyKey.current) timer.current = setTimeout(flush, RETRY_DELAY)
    }
  }

  // After a write: `written` is now stored. Show it — or, if the list was
  // edited meanwhile, the newer edits applied on top of it.
  function settle(savedKey, written, sent, savedVersion) {
    if (latest.current.key !== savedKey) return
    base.current = written
    if (savedVersion === version.current) {
      dirtyKey.current = null
      latest.current = { key: savedKey, items: written }
      setItems(written)
    } else {
      const next = mergeList(written, latest.current.items, sent)
      latest.current = { key: savedKey, items: next }
      setItems(next)
    }
  }

  // A row restored from history into `rowKey`: add it to the end of this
  // table's lists if missing (the same place the transaction put it).
  // Treated as an edit (dirty + auto-save), so stale snapshots are ignored
  // and every later write keeps it. Never adds a duplicate.
  function adopt(rowKey, row) {
    const missing = (list) => !list.some((item) => item.id === row.id)
    for (const target of waiting.current) {
      if (target.key === rowKey && missing(target.items)) {
        target.items = [...target.items, row]
      }
    }
    // Only into a list that has loaded: a list still waiting for its first
    // snapshot would otherwise save just this row over the day's real rows.
    // (Not loaded yet = not dirty, so the snapshot itself brings the row.)
    if (
      latest.current.key === rowKey &&
      loadedKey.current === rowKey &&
      missing(latest.current.items)
    ) {
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
          loadedKey.current = key
          if (dirtyKey.current === key) return // keep local edits
          base.current = remote
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

  // Back online after a failed save: try again now.
  useEffect(() => {
    const retry = () => dirtyKey.current && latestFlush.current()
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])

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
    base.current = []
    latest.current = { key: nextKey, items: [] }
    setItems([])
    setLoading(true)
  }

  // Removes one row via a Firestore transaction `run(item, remaining, base)`
  // that also writes this list without the row (complete / delete), merged
  // like a save, and returns the list written.
  // The row only leaves the screen after the transaction succeeds; if it
  // fails nothing was written and the row stays. Returns the written list,
  // or throws.
  function removeVia(id, run) {
    // The transaction saves this list (including pending edits), so cancel
    // the pending auto-save; a save already running finishes first.
    clearTimeout(timer.current)
    timer.current = null
    return serial(async () => {
      // Don't build "remaining" from a list that may be missing a row a
      // running restore is about to add.
      await waitForSaves()
      const item = latest.current.items.find((row) => row.id === id)
      if (!item) return undefined

      const startVersion = version.current
      const runKey = latest.current.key
      const remaining = latest.current.items.filter((row) => row.id !== id)

      try {
        const written = await run(item, remaining, base.current)
        settle(runKey, written, remaining, startVersion)
        if (version.current === startVersion) {
          setSaveState('saved')
        } else {
          // Edited during the transaction: drop the row from the newer list.
          update(latest.current.items.filter((row) => row.id !== id))
        }
        return written
      } catch (err) {
        // Nothing was written; the row stays. Re-arm any pending auto-save.
        if (dirtyKey.current === runKey) timer.current = setTimeout(flush, SAVE_DELAY)
        throw err
      }
    })
  }

  return { items, loading, loadError, saveState, latest, flush, update, switchTo, removeVia }
}
