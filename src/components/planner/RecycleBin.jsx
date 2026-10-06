import { useEffect, useState } from 'react'
import { deleteBinItem, restoreBinItem, subscribeBin } from '../../lib/plannerData.js'
import { Message, RowAction, TypeLabel } from './TableParts.jsx'
import { formatStamp, originText, useMessage } from './tableHelpers.js'
import { restoreWithSync } from './useSyncedItems.js'
import { useUndo } from './useUndo.js'

const BIN_LIMIT = 50

function restoredText(result) {
  if (result.destination === 'daily') return 'Restored to today’s Daily Plan.'
  if (result.destination === 'midTerm') return 'Restored to Mid-term Plan.'
  if (result.destination === 'longTerm') return 'Restored to Long-term Plan.'
  return 'Already restored.'
}

// Deleted tasks (kept until "Delete permanently"). Shown as its own Planner
// tab; the Firestore listener only runs while that tab is open.
export default function RecycleBin({ flushers }) {
  return (
    <section className="pl-section pl-sec-bin" aria-labelledby="pl-bin-title">
      <div className="pl-plan-head">
        <h2 id="pl-bin-title" className="pl-sr-only">
          Recycle Bin
        </h2>
        <p className="pl-section-note">
          Deleted tasks stay here until you delete them permanently.
        </p>
      </div>
      <BinList flushers={flushers} />
    </section>
  )
}

function BinList({ flushers }) {
  const [entries, setEntries] = useState(undefined) // undefined = loading
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [confirmId, setConfirmId] = useState(null) // row asking "Delete forever?"
  const [message, setMessage] = useMessage()
  const undo = useUndo()

  useEffect(
    () =>
      subscribeBin(
        (list) => {
          setEntries(list)
          setError(false)
        },
        () => {
          setEntries([])
          setError(true)
        },
        BIN_LIMIT,
      ),
    [],
  )

  async function restore(entry) {
    if (busyId) return
    setBusyId(entry.id)
    setConfirmId(null)
    try {
      const result = await restoreWithSync(flushers, () => restoreBinItem(entry.id))
      undo.forget(entry.id) // restored by hand: a pending "undo delete" has nothing left to do
      setMessage({ text: restoredText(result) })
    } catch {
      setMessage({ text: 'Couldn’t restore this task. Please try again.' })
    } finally {
      setBusyId(null)
    }
  }

  // Permanent: never registers an Undo (and drops one that pointed at this task).
  async function deleteForever(id) {
    if (busyId) return
    setBusyId(id)
    try {
      await deleteBinItem(id)
      undo.forget(id)
      setConfirmId(null)
      setMessage({ text: 'Deleted permanently.' })
    } catch {
      setMessage({ text: 'Couldn’t delete this task. Please try again.' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div id="pl-bin" className="pl-surface">
        {entries === undefined ? (
          <p className="pl-empty">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="pl-empty">
            {error
              ? 'Couldn’t load the Recycle Bin. Check your connection.'
              : 'Recycle Bin is empty.'}
          </p>
        ) : (
          <ol className="pl-tasks is-type">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="pl-task is-binned"
                aria-busy={busyId === entry.id || undefined}
              >
                <span className="pl-num">{index + 1}</span>
                <span className="pl-when">
                  <TypeLabel type={entry.type} />
                </span>
                <div className="pl-task-body">
                  <p className="pl-task-text">{entry.task}</p>
                  <p className="pl-sub">
                    {[
                      originText(entry),
                      entry.deletedAt && `Deleted ${formatStamp(entry.deletedAt)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className="pl-task-actions">
                  {confirmId === entry.id ? (
                    <>
                      <span className="pl-confirm-text">Delete forever?</span>
                      <button
                        type="button"
                        className="pl-btn pl-btn-sm pl-btn-danger"
                        onClick={() => deleteForever(entry.id)}
                        disabled={busyId !== null}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="pl-btn pl-btn-sm"
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <RowAction
                        icon="restore"
                        label="Restore deleted task"
                        text="Restore"
                        onClick={() => restore(entry)}
                        disabled={busyId !== null}
                      />
                      <RowAction
                        icon="trash"
                        label="Delete permanently"
                        onClick={() => setConfirmId(entry.id)}
                        disabled={busyId !== null}
                        danger
                      />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
        {entries?.length === BIN_LIMIT && (
          <p className="pl-empty pl-history-note">Showing the latest {BIN_LIMIT}.</p>
        )}
      </div>
      <Message message={message} />
    </>
  )
}
