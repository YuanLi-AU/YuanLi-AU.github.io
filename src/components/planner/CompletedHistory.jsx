import { useEffect, useState } from 'react'
import { formatShortDate, toDateKey } from '../../lib/dates.js'
import { restoreHistoryItem, subscribeHistory } from '../../lib/plannerData.js'
import { Message } from './TableParts.jsx'
import { useMessage } from './tableHelpers.js'
import { adoptRestoredRow, pauseSaves } from './useSyncedItems.js'

const TYPE_LABELS = { daily: 'Daily', 'mid-term': 'Mid-term', 'long-term': 'Long-term' }
const RESTORED_TO = {
  daily: 'Restored to today’s Daily Plan.',
  midTerm: 'Restored to Mid-term Plan.',
  longTerm: 'Restored to Long-term Plan.',
}
const HISTORY_LIMIT = 50

function formatCompleted(timestamp) {
  if (!timestamp) return ''
  return timestamp.toDate().toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function originalDateText(entry) {
  if (entry.type === 'daily') {
    if (!entry.originalDate) return ''
    return entry.time
      ? `${formatShortDate(entry.originalDate)} · ${entry.time}`
      : formatShortDate(entry.originalDate)
  }
  return entry.targetDate ? `Target ${formatShortDate(entry.targetDate)}` : '—'
}

// Most recent completions, with ↩ Restore. Collapsed by default; the
// Firestore listener only runs while it is open.
export default function CompletedHistory({ flushers }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="pl-section pl-sec-history" aria-labelledby="pl-history-title">
      <div className="pl-plan-head">
        <h2 id="pl-history-title">Completed History</h2>
        <button
          type="button"
          className="pl-link"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="pl-history"
        >
          {open ? 'Hide completed history' : 'Show completed history'}
        </button>
      </div>
      {open && <HistoryTable flushers={flushers} />}
    </section>
  )
}

function HistoryTable({ flushers }) {
  const [entries, setEntries] = useState(undefined) // undefined = loading
  const [error, setError] = useState(false)
  const [restoringId, setRestoringId] = useState(null)
  const [message, setMessage] = useMessage()

  useEffect(
    () =>
      subscribeHistory(
        (list) => {
          setEntries(list)
          setError(false)
        },
        () => {
          setEntries([])
          setError(true)
        },
        HISTORY_LIMIT,
      ),
    [],
  )

  // ↩ Restore:
  //  1. save pending edits in every table;
  //  2. pause table writes while the transaction runs (active list + history
  //     delete, both or neither), so no stale list can be written meanwhile;
  //  3. on success, hand the restored row to its table before writes resume,
  //     so later auto-saves include it.
  async function restore(id) {
    if (restoringId) return
    setRestoringId(id)
    try {
      if (flushers) await Promise.all([...flushers].map((flush) => flush()))
      const resume = pauseSaves()
      let result
      try {
        result = await restoreHistoryItem(id, toDateKey())
        if (result.row) adoptRestoredRow(result.key, result.row)
      } finally {
        resume()
      }
      setMessage({ text: RESTORED_TO[result.destination] ?? 'Already restored.' })
    } catch {
      setMessage({ text: 'Couldn’t restore this item. Please try again.' })
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <>
      <div id="pl-history" className="pl-table pl-history">
        <div className="pl-cols" aria-hidden="true">
          <span>Completed</span>
          <span>Type</span>
          <span>Task</span>
          <span>Note</span>
          <span>Original date</span>
          <span>Actions</span>
        </div>

        {entries === undefined ? (
          <p className="pl-empty">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="pl-empty">
            {error ? 'Couldn’t load history. Check your connection.' : 'Nothing completed yet.'}
          </p>
        ) : (
          <ul className="pl-list">
            {entries.map((entry) => (
              <li key={entry.id} className="pl-row" aria-busy={restoringId === entry.id || undefined}>
                <span className="pl-cell pl-when">{formatCompleted(entry.completedAt)}</span>
                <span className="pl-cell">
                  <span className={`pl-type is-${entry.type}`}>{TYPE_LABELS[entry.type] ?? ''}</span>
                </span>
                <span className="pl-cell pl-task">{entry.task}</span>
                <span className="pl-cell pl-notes">{entry.notes}</span>
                <span className="pl-cell pl-orig">{originalDateText(entry)}</span>
                <div className="pl-row-actions">
                  <button
                    type="button"
                    className="pl-icon-btn pl-restore"
                    onClick={() => restore(entry.id)}
                    disabled={restoringId !== null}
                    title="Restore"
                    aria-label="Restore completed item"
                  >
                    ↩
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {entries?.length === HISTORY_LIMIT && (
          <p className="pl-empty pl-history-note">Showing the latest {HISTORY_LIMIT}.</p>
        )}
      </div>
      <Message message={message} />
    </>
  )
}
