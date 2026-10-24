import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useRef, useState } from 'react'
import { formatShortDate } from '../../lib/dates.js'
import { ROW_GONE } from '../../lib/plannerData.js'

const LIST_LABELS = { daily: 'Daily', midTerm: 'Mid-term', longTerm: 'Long-term' }

// Status message under a list ({ text }); hides after 6 seconds.
export function useMessage() {
  const [message, setMessage] = useState(null)
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 6000)
    return () => clearTimeout(t)
  }, [message])
  return [message, setMessage]
}

// Task actions for one list (Daily / Mid-term / Long-term).
//   complete / delete run as Firestore transactions via removeVia — the row
//     only leaves the list once its transaction has succeeded (it is then in
//     Completed History / the Recycle Bin, where Restore brings it back);
//   add / reorder are ordinary edits saved by the list's auto-save.
// Row transactions of one list run one after another (in the order they
// were asked for — e.g. two rows dragged to Mid-term in quick succession);
// a row already waiting or running is not queued twice.
//
// Options: list (from useSyncedItems), setMessage,
//   complete / bin (item, remaining, base) — the list's transactions;
//   move(item, remaining, base, toListId) — to another list.
// `busy` maps the id of each waiting / running row to its kind.
export function useTaskActions({ list, setMessage, complete, bin, move }) {
  const [busy, setBusy] = useState({}) // id → 'complete' | 'delete' | 'move'
  const queued = useRef(new Set())
  const queue = useRef(Promise.resolve())

  function runRow(id, kind, transaction, doneText, failText) {
    if (queued.current.has(id)) return
    if (!list.latest.current.items.some((row) => row.id === id)) return
    queued.current.add(id)
    setBusy((prev) => ({ ...prev, [id]: kind }))
    queue.current = queue.current.then(async () => {
      try {
        // undefined: the row had already left the list (nothing to report)
        const written = await list.removeVia(id, transaction)
        if (written) setMessage({ text: doneText })
      } catch (err) {
        // nothing was written; the row stays
        setMessage({
          text:
            err?.code === ROW_GONE
              ? 'This task was already changed on another device.'
              : failText,
        })
      } finally {
        queued.current.delete(id)
        setBusy((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    })
  }

  function add(row) {
    list.update([...list.latest.current.items, row])
  }

  function completeRow(id) {
    runRow(
      id,
      'complete',
      complete,
      'Completed — saved to history.',
      'Couldn’t complete this task. Check your connection and try again.',
    )
  }

  // Delete = move to the Recycle Bin (one transaction). A blank row has
  // nothing worth keeping, so it is simply removed.
  function removeRow(id) {
    const { items } = list.latest.current
    const item = items.find((row) => row.id === id)
    if (!item) return
    if (!item.task.trim()) {
      list.update(items.filter((row) => row.id !== id))
      return
    }
    runRow(
      id,
      'delete',
      bin,
      'Moved to Recycle Bin.',
      'Couldn’t delete this task. Check your connection and try again.',
    )
  }

  // Drag & drop: move `activeId` to where `overId` is. Positions come from
  // the newest list (it may have changed during the drag); no change, no save.
  function reorder(activeId, overId) {
    const { items } = list.latest.current
    const from = items.findIndex((row) => row.id === activeId)
    const to = items.findIndex((row) => row.id === overId)
    if (from < 0 || to < 0 || from === to) return
    list.update(arrayMove(items, from, to))
  }

  // Move the row to another list (dropped on its tab): one transaction,
  // like complete / delete; not a completion.
  function moveRow(id, to) {
    runRow(
      id,
      'move',
      (item, remaining, base) => move(item, remaining, base, to),
      `Moved to ${LIST_LABELS[to]}.`,
      'Couldn’t move this task. Check your connection and try again.',
    )
  }

  return { busy, add, reorder, complete: completeRow, remove: removeRow, move: moveRow }
}

// Row labels: A, B, … Z, AA, AB, … (Daily) — display only, from the position.
export function sequenceLetter(index) {
  let n = index + 1
  let label = ''
  while (n > 0) {
    n -= 1
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26)
  }
  return label
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
