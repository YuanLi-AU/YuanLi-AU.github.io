import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useRef, useState } from 'react'
import { formatShortDate } from '../../lib/dates.js'

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
// Only one row transaction runs at a time per list.
//
// Options: list (from useSyncedItems), setMessage,
//   complete(item, remaining) / bin(item, remaining) — the list's transactions.
export function useTaskActions({ list, setMessage, complete, bin }) {
  const [busy, setBusy] = useState(null) // { id, kind } of the running row
  const running = useRef(false)

  async function runRow(id, kind, transaction, doneText, failText) {
    if (running.current) return
    if (!list.latest.current.items.some((row) => row.id === id)) return
    running.current = true
    setBusy({ id, kind })
    try {
      await list.removeVia(id, transaction)
      setMessage({ text: doneText })
    } catch {
      setMessage({ text: failText }) // nothing was written
    } finally {
      running.current = false
      setBusy(null)
    }
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

  return { busy, add, reorder, complete: completeRow, remove: removeRow }
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
