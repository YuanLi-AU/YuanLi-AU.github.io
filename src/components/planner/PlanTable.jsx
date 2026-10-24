import {
  binPlanItem,
  completePlanItem,
  createPlanItem,
  moveBetween,
  PLAN_TYPES,
  savePlan,
  subscribePlan,
} from '../../lib/plannerData.js'
import { useEffect } from 'react'
import AddTaskForm from './AddTaskForm.jsx'
import SortableTasks from './SortableTasks.jsx'
import TaskRow, { DragChip } from './TaskRow.jsx'
import { Message, SaveStatus } from './TableParts.jsx'
import { sequenceLetter, useMessage, useTaskActions } from './tableHelpers.js'
import { onDueMoved } from './useDueMove.js'
import useSyncedItems from './useSyncedItems.js'

// Rows are labelled A, B, C, … (then AA, AB, …) by position, like Daily —
// display only; the stored order is the list order.
const rowLabel = sequenceLetter

// Mid-term / Long-term plan list: same task format as the Daily Plan, with
// an optional Due date (stored as targetDate), reorderable by dragging the
// letter, or moved by dropping the letter on the Daily / other plan tab.
// A row whose Due date arrives moves to the Daily list (useDueMove).
// `planId` is "midTerm" or "longTerm".
export default function PlanTable({ planId, title, flushers }) {
  const list = useSyncedItems(planId, subscribePlan, savePlan, flushers)
  const [message, setMessage] = useMessage()
  const rows = useTaskActions({
    list,
    setMessage,
    complete: (item, remaining, base) => completePlanItem(planId, item, remaining, base),
    bin: (item, remaining, base) => binPlanItem(planId, item, remaining, base),
    move: (item, remaining, base, to) => moveBetween(planId, to, item, remaining, base),
  })
  const headingId = `pl-${planId}-title`

  // Rows that just moved to Daily (their Due date arrived): say so here.
  useEffect(
    () =>
      onDueMoved((counts) => {
        const n = counts[PLAN_TYPES[planId]] ?? 0
        if (n > 0) setMessage({ text: `Due — ${n === 1 ? '1 task' : `${n} tasks`} moved to Daily.` })
      }),
    [planId, setMessage],
  )

  // While a row is dragged: its number and task beside the pointer.
  function preview(id) {
    const index = list.items.findIndex((item) => item.id === id)
    return <DragChip number={rowLabel(index)} task={list.items[index]?.task ?? ''} />
  }

  function addItem(task, targetDate) {
    rows.add({ ...createPlanItem(), task, targetDate })
  }

  function changeItem(id, patch) {
    list.update(list.items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <section className={`pl-section pl-sec-${planId}`} aria-labelledby={headingId}>
      <h2 id={headingId} className="pl-sr-only">
        {title}
      </h2>

      <div className="pl-surface">
        {list.loading ? (
          <p className="pl-empty">Loading…</p>
        ) : (
          <>
            {list.items.length > 0 && (
              <SortableTasks
                items={list.items}
                label={rowLabel}
                onReorder={rows.reorder}
                listId={planId}
                onDropTab={rows.move}
                preview={preview}
                className="pl-tasks is-plan"
              >
                {list.items.map((item, index) => (
                  <TaskRow
                    key={item.id}
                    number={rowLabel(index)}
                    item={item}
                    dueType="date"
                    done={rows.busy[item.id] === 'complete'}
                    busy={Boolean(rows.busy[item.id])}
                    locked={Boolean(rows.busy[item.id])}
                    onChange={(patch) => changeItem(item.id, patch)}
                    onComplete={() => rows.complete(item.id)}
                  />
                ))}
              </SortableTasks>
            )}
            {list.items.length === 0 && (
              <p className="pl-empty">
                {list.loadError ? 'Couldn’t load. Check your connection.' : 'No plans yet.'}
              </p>
            )}
          </>
        )}

        <AddTaskForm whenType="date" onAdd={addItem} disabled={list.loading} />
      </div>
      <div className="pl-foot">
        <Message message={message} />
        <SaveStatus state={list.saveState} onRetry={list.flush} />
      </div>
    </section>
  )
}
