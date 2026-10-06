import { useEffect, useState } from 'react'
import { restoreHistoryItem, subscribeHistory } from '../../lib/plannerData.js'
import { Checkbox, Message, RowAction, TypeLabel } from './TableParts.jsx'
import { formatStamp, originText, useMessage } from './tableHelpers.js'
import { restoreWithSync } from './useSyncedItems.js'
import { useUndo } from './useUndo.js'

const RESTORED_TO = {
  daily: 'Restored to today’s Daily Plan.',
  midTerm: 'Restored to Mid-term Plan.',
  longTerm: 'Restored to Long-term Plan.',
}
const RECENT = 3 // shown by default
const ALL = 50 // "View all"

// Completed tasks (deleted tasks live in the Recycle Bin, not here).
// Shows the 3 most recent; "View all" lists up to the latest 50. Unticking
// the checkbox or ↩ Restore puts a task back into its active list.
export default function CompletedHistory({ flushers }) {
  const [showAll, setShowAll] = useState(false)
  const [entries, setEntries] = useState(undefined) // undefined = loading
  const [error, setError] = useState(false)
  const [restoringId, setRestoringId] = useState(null)
  const [message, setMessage] = useMessage()
  const undo = useUndo()

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
        showAll ? ALL : RECENT,
      ),
    [showAll],
  )

  async function restore(id) {
    if (restoringId) return
    setRestoringId(id)
    try {
      const result = await restoreWithSync(flushers, () => restoreHistoryItem(id))
      undo.forget(id) // restored by hand: a pending "undo complete" has nothing left to do
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
          <span className="pl-label">{showAll ? 'Completed History' : 'Recent Completed'}</span>
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
          <ol className="pl-tasks is-type">
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
                <span className="pl-num">{index + 1}</span>
                <span className="pl-when">
                  <TypeLabel type={entry.type} />
                </span>
                <div className="pl-task-body">
                  <p className="pl-task-text">{entry.task}</p>
                  <p className="pl-sub">
                    {[
                      originText(entry),
                      entry.completedAt && `Done ${formatStamp(entry.completedAt)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
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
