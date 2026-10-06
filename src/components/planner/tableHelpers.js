import { useEffect, useRef, useState } from 'react'
import { formatShortDate } from '../../lib/dates.js'
import { insertAt, restoreBinItem, restoreHistoryItem } from '../../lib/plannerData.js'
import { useUndo } from './useUndo.js'
import { restoreWithSync } from './useSyncedItems.js'

// Status message under a list ({ text, undoId? }); hides after 6 seconds.
export function useMessage() {
  const [message, setMessage] = useState(null)
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 6000)
    return () => clearTimeout(t)
  }, [message])
  return [message, setMessage]
}

// Task actions for one list (Daily / Mid-term / Long-term), each registering
// a one-level Undo once it has succeeded (see useUndo.js). Nothing here
// bypasses the existing safety:
//   complete / delete run as Firestore transactions via removeVia —
//     the row only leaves the list once its transaction has succeeded;
//   their undos run through restoreWithSync (save everything, pause writes,
//     one transaction, hand the row back) — the same path as ↩ Restore;
//   add / edit / their undos are ordinary edits saved by the list's auto-save.
// Row transactions and undos never overlap (undo.hold / undo.isRunning).
//
// Options: list (from useSyncedItems), setMessage, flushers,
//   complete(item, remaining) / bin(item, remaining) — the list's transactions.
export function useTaskActions({ list, setMessage, flushers, complete, bin }) {
  const undo = useUndo()
  const [busy, setBusy] = useState(null) // { id, kind } of the running row
  const running = useRef(false)
  const listRef = useRef(list)
  useEffect(() => {
    listRef.current = list
  })

  // Undo helper: shows the outcome in this list's message line; a failure
  // is re-thrown so the undo stays available to retry.
  const undoing = (fn) => async () => {
    setMessage(null)
    try {
      setMessage({ text: await fn() })
    } catch (err) {
      setMessage({ text: 'Couldn’t undo. Check your connection and try again.' })
      throw err
    }
  }

  async function runRow(id, kind, transaction, onSuccess, failText) {
    if (running.current || undo.isRunning()) return
    const before = list.latest.current
    const index = before.items.findIndex((row) => row.id === id)
    const item = before.items[index]
    if (!item) return
    running.current = true
    undo.hold(true)
    setBusy({ id, kind })
    try {
      const result = await list.removeVia(id, transaction)
      setMessage(onSuccess(result, { item, index, key: before.key }))
    } catch {
      setMessage({ text: failText }) // nothing was written, so nothing to undo
    } finally {
      running.current = false
      undo.hold(false)
      setBusy(null)
    }
  }

  // Edits made through the list (auto-saved); undo only if the row is still
  // in the same list.
  function localUndo(key, id, apply, doneText) {
    return undoing(async () => {
      const current = listRef.current.latest.current
      if (current.key !== key) return 'Nothing to undo — this task has changed since.'
      const next = apply(current.items)
      if (!next) return 'Nothing to undo — this task has changed since.'
      listRef.current.update(next)
      return doneText
    })
  }

  function add(row) {
    const key = list.latest.current.key
    list.update([...list.latest.current.items, row])
    undo.register(
      `added “${row.task}”`,
      row.id,
      localUndo(
        key,
        row.id,
        (items) =>
          items.some((r) => r.id === row.id) ? items.filter((r) => r.id !== row.id) : null,
        'Undone — task removed.',
      ),
    )
  }

  // `before` = the row's fields when editing started.
  function edited(id, before) {
    const { key, items } = list.latest.current
    const now = items.find((r) => r.id === id)
    if (!now || Object.keys(before).every((field) => now[field] === before[field])) return
    undo.register(
      `edited “${before.task || now.task}”`,
      id,
      localUndo(
        key,
        id,
        (rows) =>
          rows.some((r) => r.id === id)
            ? rows.map((r) => (r.id === id ? { ...r, ...before } : r))
            : null,
        'Undone — edit reverted.',
      ),
    )
  }

  function completeRow(id) {
    runRow(
      id,
      'complete',
      complete,
      (_result, { item, index }) => {
        undo.register(
          `completed “${item.task}”`,
          id,
          undoing(async () => {
            const back = await restoreWithSync(flushers, () => restoreHistoryItem(id, index))
            return back.destination
              ? 'Undone — task is active again.'
              : 'Nothing to undo — it was already restored.'
          }),
        )
        return { text: 'Completed — saved to history.' }
      },
      'Couldn’t complete this task. Check your connection and try again.',
    )
  }

  // Delete = move to the Recycle Bin (one transaction). A blank row has
  // nothing worth keeping, so it is simply removed (undo puts it back).
  function removeRow(id) {
    const { key, items } = list.latest.current
    const index = items.findIndex((row) => row.id === id)
    const item = items[index]
    if (!item) return
    if (!item.task.trim()) {
      list.update(items.filter((row) => row.id !== id))
      undo.register(
        'deleted an empty task',
        id,
        localUndo(
          key,
          id,
          (rows) => (rows.some((r) => r.id === id) ? null : insertAt(rows, item, index)),
          'Undone — task put back.',
        ),
      )
      return
    }
    runRow(
      id,
      'delete',
      bin,
      (_result, ctx) => {
        const undoId = undo.register(
          `deleted “${ctx.item.task}”`,
          id,
          undoing(async () => {
            const back = await restoreWithSync(flushers, () => restoreBinItem(id, ctx.index))
            return back.destination
              ? 'Undone — restored from the Recycle Bin.'
              : 'Nothing to undo — it is no longer in the Recycle Bin.'
          }),
        )
        return { text: 'Moved to Recycle Bin.', undoId }
      },
      'Couldn’t delete this task. Check your connection and try again.',
    )
  }

  return { busy, add, edited, complete: completeRow, remove: removeRow }
}

// "6 Oct, 3:40 pm" for completed / deleted timestamps.
export function formatStamp(timestamp) {
  if (!timestamp) return ''
  return timestamp.toDate().toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Where a history / bin entry came from: "6 Oct 2026 · 09:00" or "Target 20 Oct 2026".
export function originText(entry) {
  if (entry.type === 'daily') {
    if (!entry.originalDate) return ''
    const date = formatShortDate(entry.originalDate)
    return entry.time ? `${date} · ${entry.time}` : date
  }
  return entry.targetDate ? `Target ${formatShortDate(entry.targetDate)}` : ''
}
