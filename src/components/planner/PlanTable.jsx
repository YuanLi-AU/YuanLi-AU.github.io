import { useState } from 'react'
import {
  completePlanItem,
  createPlanItem,
  savePlan,
  subscribePlan,
} from '../../lib/plannerData.js'
import { CompleteButton, DeleteButton, Message, SaveStatus } from './TableParts.jsx'
import { deleteWithUndo, useMessage } from './tableHelpers.js'
import useSyncedItems from './useSyncedItems.js'

// Mid-term / Long-term plan table: Target date | Plan | Note | Status | Actions.
// `planId` is "midTerm" or "longTerm". Target dates are optional.
export default function PlanTable({ planId, title, flushers }) {
  const list = useSyncedItems(planId, subscribePlan, savePlan, flushers)
  const [message, setMessage] = useMessage()
  const [busyId, setBusyId] = useState(null)
  const [focusId, setFocusId] = useState(null)
  const headingId = `pl-${planId}-title`

  function addItem() {
    const item = createPlanItem()
    setFocusId(item.id)
    list.update([...list.items, item])
  }

  function changeItem(id, patch) {
    list.update(list.items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  async function complete(id) {
    if (busyId) return
    setBusyId(id)
    try {
      await list.removeVia(id, (item, remaining) => completePlanItem(planId, item, remaining))
      setMessage({ text: 'Completed — saved to history.' })
    } catch {
      setMessage({ text: 'Couldn’t complete this plan. Check your connection and try again.' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className={`pl-section pl-sec-${planId}`} aria-labelledby={headingId}>
      <div className="pl-plan-head">
        <h2 id={headingId}>{title}</h2>
        <SaveStatus state={list.saveState} onRetry={list.flush} />
      </div>

      <div className="pl-table pl-plans">
        <div className="pl-cols" aria-hidden="true">
          <span>Target date</span>
          <span>Plan</span>
          <span>Note</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {list.loading ? (
          <p className="pl-empty">Loading…</p>
        ) : (
          <>
            <ul className="pl-list">
              {list.items.map((item) => (
                <li key={item.id} className="pl-row" aria-busy={busyId === item.id || undefined}>
                  <input
                    type="date"
                    className="pl-field pl-when"
                    value={item.targetDate}
                    onChange={(e) => changeItem(item.id, { targetDate: e.target.value })}
                    aria-label="Target date"
                  />
                  <input
                    type="text"
                    className="pl-field pl-task"
                    value={item.task}
                    onChange={(e) => changeItem(item.id, { task: e.target.value })}
                    placeholder="Plan"
                    aria-label="Plan"
                    autoFocus={item.id === focusId}
                  />
                  <input
                    type="text"
                    className="pl-field pl-notes"
                    value={item.notes}
                    onChange={(e) => changeItem(item.id, { notes: e.target.value })}
                    placeholder="Note"
                    aria-label="Note"
                  />
                  <div className="pl-status">
                    <CompleteButton
                      onClick={() => complete(item.id)}
                      disabled={busyId !== null || !item.task.trim()}
                    />
                  </div>
                  <div className="pl-row-actions">
                    <DeleteButton
                      onClick={() => deleteWithUndo(list, item.id, setMessage)}
                      disabled={busyId === item.id}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {list.items.length === 0 && (
              <p className="pl-empty">
                {list.loadError ? 'Couldn’t load. Check your connection.' : 'No plans yet.'}
              </p>
            )}
          </>
        )}
      </div>

      <div className="pl-actions">
        <button type="button" className="pl-btn pl-btn-add" onClick={addItem} disabled={list.loading}>
          + Add row
        </button>
      </div>

      <Message message={message} />
    </section>
  )
}
