import { useEffect } from 'react'
import {
  binDailyItem,
  completeDailyItem,
  createItem,
  migrateLegacyDaily,
  saveDaily,
  subscribeDaily,
} from '../../lib/plannerData.js'
import AddTaskForm from './AddTaskForm.jsx'
import TaskRow from './TaskRow.jsx'
import { Message, SaveStatus } from './TableParts.jsx'
import { useMessage, useTaskActions } from './tableHelpers.js'
import useSyncedItems, { restoreWithSync } from './useSyncedItems.js'
import { useUndo } from './useUndo.js'

const MIN_ROWS = 3

// Empty row positions under the real tasks, so the list always shows at
// least three rows ("the sheet is ready"). Purely visual: no data, no
// checkbox, no number, no text — and hidden from screen readers.
function EmptySlots({ count }) {
  if (count <= 0) return null
  return (
    <div className="pl-slots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="pl-slot" />
      ))}
    </div>
  )
}

// Daily Plan: the one active Daily list (plans/daily). A task stays until
// it is completed (checkbox → Completed History) or deleted (🗑 → Recycle
// Bin) — no dates, no rollover, no expiry.
export default function DailyPlanner({ flushers }) {
  const list = useSyncedItems('daily', subscribeDaily, saveDaily, flushers)
  const [message, setMessage] = useMessage()
  const rows = useTaskActions({
    list,
    setMessage,
    flushers,
    complete: completeDailyItem,
    bin: binDailyItem,
  })
  const undo = useUndo()

  // One-time move of the old per-day Daily data (see migrateLegacyDaily).
  // After it has succeeded once this does nothing (no reads). Runs like a
  // Restore (pending edits saved first, writes wait, rows handed to this
  // list); not undoable, and Undo waits while it runs.
  useEffect(() => {
    let active = true
    async function migrate() {
      undo.hold(true)
      try {
        const result = await restoreWithSync(flushers, () => migrateLegacyDaily())
        const n = result.rows.length
        if (active && n > 0) {
          setMessage({
            text: `${n} unfinished task${n === 1 ? '' : 's'} brought over from earlier days.`,
          })
        }
      } catch {
        if (active) {
          setMessage({
            text: 'Couldn’t bring over earlier tasks — they’re safe and will be tried again.',
          })
        }
      } finally {
        undo.hold(false)
      }
    }
    migrate()
    return () => {
      active = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function addItem(task, time) {
    rows.add({ ...createItem(), task, time })
  }

  function changeItem(id, patch) {
    list.update(list.items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <section className="pl-section pl-sec-daily" aria-labelledby="pl-daily-title">
      {/* The selected tab is the visible title; this one is for screen readers. */}
      <h2 id="pl-daily-title" className="pl-sr-only">
        Daily Plan
      </h2>

      <div className="pl-surface">
        {/* Always at least three task rows tall, so today's list reads as the main workspace */}
        <div className="pl-workspace">
          {list.loading ? (
            <p className="pl-empty">Loading…</p>
          ) : (
            <>
              {list.items.length > 0 && (
                <ol className="pl-tasks is-time">
                  {list.items.map((item, index) => (
                    <TaskRow
                      key={item.id}
                      number={index + 1}
                      item={item}
                      whenType="time"
                      done={rows.busy?.id === item.id && rows.busy.kind === 'complete'}
                      busy={rows.busy?.id === item.id}
                      locked={rows.busy !== null}
                      onChange={(patch) => changeItem(item.id, patch)}
                      onEditDone={(before) => rows.edited(item.id, before)}
                      onComplete={() => rows.complete(item.id)}
                      onDelete={() => rows.remove(item.id)}
                    />
                  ))}
                </ol>
              )}
              {list.loadError && list.items.length === 0 ? (
                <p className="pl-empty">Couldn’t load today’s plan. Check your connection.</p>
              ) : (
                <EmptySlots count={MIN_ROWS - list.items.length} />
              )}
            </>
          )}
        </div>

        <AddTaskForm whenType="time" onAdd={addItem} disabled={list.loading} />
      </div>
      <div className="pl-foot">
        <Message message={message} />
        <SaveStatus state={list.saveState} onRetry={list.flush} />
      </div>
    </section>
  )
}
