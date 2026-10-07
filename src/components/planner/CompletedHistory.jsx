import { useEffect, useRef, useState } from 'react'
import { formatShortDate } from '../../lib/dates.js'
import { countHistory, restoreHistoryItem, subscribeHistory } from '../../lib/plannerData.js'
import { Checkbox, Message, RowAction, TypeLabel } from './TableParts.jsx'
import { formatStamp, originText, useMessage } from './tableHelpers.js'
import { restoreWithSync } from './useSyncedItems.js'

const RESTORED_TO = {
  daily: 'Restored to today’s Daily Plan.',
  midTerm: 'Restored to Mid-term Plan.',
  longTerm: 'Restored to Long-term Plan.',
}
// The line under a completed task: when it was really completed (completedAt).
// Daily tasks have no planned time any more, and an older saved `time` is
// never shown as the completion time; Mid/Long keep their target date.
function completedText(entry) {
  const done = entry.completedAt && `Completed ${formatStamp(entry.completedAt)}`
  if (entry.type === 'daily') {
    return done || (entry.originalDate ? formatShortDate(entry.originalDate) : '')
  }
  return [originText(entry), done].filter(Boolean).join(' · ')
}

const RECENT = 3 // shown by default
const ALL = 50 // "View all"

// Completed tasks (deleted tasks live in the Recycle Bin, not here).
// Shows the 3 most recent; "View all" lists up to the latest 50. Unticking
// the checkbox or ↩ Restore puts a task back into its active list.
//
// The title shows how many completed rows history holds, and each row is
// numbered by its place in it: oldest = 1, newest = total. The shown rows
// are always the newest ones, so row `index` (newest first) is
// `total - index`. The total is a count query, re-run whenever the shown
// rows change (complete / restore end in a transaction, so the count already
// includes them); until it arrives, numbers stay blank rather than wrong.
export default function CompletedHistory({ flushers }) {
  const [showAll, setShowAll] = useState(false)
  const [entries, setEntries] = useState(undefined) // undefined = loading
  const [total, setTotal] = useState(null) // null = not known (yet)
  const [error, setError] = useState(false)
  const [restoringId, setRestoringId] = useState(null)
  const [message, setMessage] = useMessage()
  const countRun = useRef(0) // only the newest count query may set the total

  async function refreshTotal() {
    const run = ++countRun.current
    setTotal(null)
    try {
      const count = await countHistory()
      if (run === countRun.current) setTotal(count)
    } catch {
      // offline etc.: no total, no numbers; the list itself still shows
    }
  }

  useEffect(
    () =>
      subscribeHistory(
        (list) => {
          setEntries(list)
          setError(false)
          refreshTotal()
        },
        () => {
          setEntries([])
          setError(true)
        },
        showAll ? ALL : RECENT,
      ),
    [showAll],
  )

  async function restore(id) {
    if (restoringId) return
    setRestoringId(id)
    try {
      const result = await restoreWithSync(flushers, () => restoreHistoryItem(id))
      setMessage({
        text: RESTORED_TO[result.destination] ?? 'Already restored.',
      })
    } catch {
      setMessage({ text: 'Couldn’t restore this item. Please try again.' })
    } finally {
      setRestoringId(null)
    }
  }

  const canToggle = showAll || entries?.length === RECENT

  return (
    <section className="pl-section pl-sec-history" aria-labelledby="pl-history-title">
      <div className="pl-plan-head">
        <h2 id="pl-history-title">
          <span className="pl-label">
            {showAll ? 'Completed History' : 'Recent Completed'} ·{' '}
            <span lang="zh-Hans">{showAll ? '完成记录' : '最近完成'}</span>
            {total !== null && <span className="pl-count"> ({total})</span>}
          </span>
        </h2>
        {canToggle && (
          <button
            type="button"
            className="pl-link"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            aria-controls="pl-history"
          >
            {showAll ? 'Show recent only' : 'View all'}
          </button>
        )}
      </div>

      <div id="pl-history" className="pl-surface is-quiet">
        {entries === undefined ? (
          <p className="pl-empty">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="pl-empty">
            {error ? 'Couldn’t load history. Check your connection.' : 'Nothing completed yet.'}
          </p>
        ) : (
          <ol className="pl-tasks is-type is-counted">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="pl-task is-done"
                aria-busy={restoringId === entry.id || undefined}
              >
                <Checkbox
                  checked
                  onClick={() => restore(entry.id)}
                  disabled={restoringId !== null}
                  label="Restore (mark as not completed)"
                />
                <span className="pl-num">{total !== null && total - index > 0 ? total - index : ''}</span>
                <span className="pl-when">
                  <TypeLabel type={entry.type} />
                </span>
                <div className="pl-task-body">
                  <p className="pl-task-text">{entry.task}</p>
                  <p className="pl-sub">{completedText(entry)}</p>
                </div>
                <div className="pl-task-actions">
                  <RowAction
                    icon="restore"
                    label="Restore completed item"
                    text="Restore"
                    onClick={() => restore(entry.id)}
                    disabled={restoringId !== null}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
        {showAll && entries?.length === ALL && (
          <p className="pl-empty pl-history-note">Showing the latest {ALL}.</p>
        )}
      </div>
      <Message message={message} />
    </section>
  )
}
