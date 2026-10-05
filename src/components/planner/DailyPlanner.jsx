import { useState } from 'react'
import { addDays, formatLongDate, toDateKey } from '../../lib/dates.js'
import {
  completeDailyItem,
  createItem,
  moveItem,
  saveDailyPlan,
  subscribeDailyPlan,
} from '../../lib/plannerData.js'
import DateNavigator from './DateNavigator.jsx'
import DailyTaskRow from './DailyTaskRow.jsx'
import { Message, SaveStatus } from './TableParts.jsx'
import { deleteWithUndo, useMessage } from './tableHelpers.js'
import useSyncedItems from './useSyncedItems.js'

// Daily Plan: active rows for one day. ✓ completes a row into history,
// → moves it to tomorrow, × deletes it (with Undo).
export default function DailyPlanner({ flushers }) {
  const [dateKey, setDateKey] = useState(() => toDateKey())
  const list = useSyncedItems(dateKey, subscribeDailyPlan, saveDailyPlan, flushers)
  const [message, setMessage] = useMessage()
  const [busyId, setBusyId] = useState(null) // row being moved / completed
  const [focusId, setFocusId] = useState(null)

  function changeDate(nextKey) {
    if (nextKey === dateKey) return
    list.switchTo(nextKey) // saves the day being left first
    setDateKey(nextKey)
    setMessage(null)
    setFocusId(null)
  }

  function addItem() {
    const item = createItem()
    setFocusId(item.id)
    list.update([...list.items, item])
  }

  function changeItem(id, patch) {
    list.update(list.items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  // Shared by move / complete: one transaction at a time; the row only leaves
  // this day once the transaction has succeeded.
  async function runOnRow(id, run, successText, failText) {
    if (busyId) return
    setBusyId(id)
    try {
      const result = await list.removeVia(id, run)
      setMessage({ text: successText(result) })
    } catch {
      setMessage({ text: failText })
    } finally {
      setBusyId(null)
    }
  }

  function moveToTomorrow(id) {
    const nextKey = addDays(dateKey, 1)
    runOnRow(
      id,
      (item, remaining) => moveItem(dateKey, nextKey, item, remaining),
      (result) =>
        result?.added
          ? `Moved to ${formatLongDate(nextKey)}.`
          : 'Already on tomorrow’s plan — removed from this day.',
      'Couldn’t move this row. Check your connection and try again.',
    )
  }

  function complete(id) {
    runOnRow(
      id,
      (item, remaining) => completeDailyItem(dateKey, item, remaining),
      () => 'Completed — saved to history.',
      'Couldn’t complete this row. Check your connection and try again.',
    )
  }

  return (
    <section className="pl-section pl-sec-daily" aria-labelledby="pl-daily-title">
      <DateNavigator dateKey={dateKey} onChange={changeDate} />

      <div className="pl-plan-head">
        <h2 id="pl-daily-title">Daily Plan</h2>
        <SaveStatus state={list.saveState} onRetry={list.flush} />
      </div>

      <div className="pl-table pl-daily">
        <div className="pl-cols" aria-hidden="true">
          <span>Time</span>
          <span>Task</span>
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
                <DailyTaskRow
                  key={item.id}
                  item={item}
                  autoFocus={item.id === focusId}
                  busy={busyId === item.id}
                  actionsDisabled={busyId !== null}
                  onChange={(patch) => changeItem(item.id, patch)}
                  onComplete={() => complete(item.id)}
                  onMove={() => moveToTomorrow(item.id)}
                  onDelete={() => deleteWithUndo(list, item.id, setMessage)}
                />
              ))}
            </ul>
            {list.items.length === 0 && (
              <p className="pl-empty">
                {list.loadError
                  ? 'Couldn’t load this day. Check your connection.'
                  : 'Nothing planned for this day yet.'}
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
