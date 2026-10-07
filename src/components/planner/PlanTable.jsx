import {
  binPlanItem,
  completePlanItem,
  createPlanItem,
  savePlan,
  subscribePlan,
} from '../../lib/plannerData.js'
import AddTaskForm from './AddTaskForm.jsx'
import SortableTasks from './SortableTasks.jsx'
import TaskRow from './TaskRow.jsx'
import { Message, SaveStatus } from './TableParts.jsx'
import { useMessage, useTaskActions } from './tableHelpers.js'
import useSyncedItems from './useSyncedItems.js'

// Rows are numbered 1, 2, 3, … by position.
const rowNumber = (index) => String(index + 1)

// Mid-term / Long-term plan list: same task format as the Daily Plan, with
// an optional target date, reorderable by dragging. `planId` is "midTerm"
// or "longTerm".
export default function PlanTable({ planId, title, flushers }) {
  const list = useSyncedItems(planId, subscribePlan, savePlan, flushers)
  const [message, setMessage] = useMessage()
  const rows = useTaskActions({
    list,
    setMessage,
    complete: (item, remaining) => completePlanItem(planId, item, remaining),
    bin: (item, remaining) => binPlanItem(planId, item, remaining),
  })
  const headingId = `pl-${planId}-title`

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
                label={rowNumber}
                onReorder={rows.reorder}
                className="pl-tasks is-date"
              >
                {list.items.map((item, index) => (
                  <TaskRow
                    key={item.id}
                    number={rowNumber(index)}
                    item={item}
                    whenType="date"
                    done={rows.busy?.id === item.id && rows.busy.kind === 'complete'}
                    busy={rows.busy?.id === item.id}
                    locked={rows.busy !== null}
                    onChange={(patch) => changeItem(item.id, patch)}
                    onComplete={() => rows.complete(item.id)}
                    onDelete={() => rows.remove(item.id)}
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
