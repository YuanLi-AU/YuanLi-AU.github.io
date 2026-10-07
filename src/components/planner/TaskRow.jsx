import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useLayoutEffect, useRef, useState } from 'react'
import { formatShortDate, fromDateKey } from '../../lib/dates.js'
import PlannerIcon from './PlannerIcons.jsx'
import { Checkbox, RowAction, TimeSelect } from './TableParts.jsx'

// Enter / Escape finish editing — but not while an IME (e.g. Chinese
// input) is still composing, where Enter only confirms the characters.
const isComposing = (e) => e.nativeEvent.isComposing || e.keyCode === 229

// "20 Oct" this year, "20 Oct 2027" otherwise.
function compactDate(dateKey) {
  const date = fromDateKey(dateKey)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

// One task in Daily / Mid-term / Long-term, on one line (desktop):
//
//   ( )  A   09:00    Task text (wraps naturally)            ⠿  ✎  🗑
//
// `number` is the row's label (A, B, … for Daily; 1, 2, … otherwise).
// `whenType` is "time" (daily) or "date" (mid/long-term target). `done`
// shows the completed look while the complete transaction runs; the row then
// moves to Completed History. Edits are saved by the list's auto-save.
// Only the ⠿ handle starts a drag (see SortableTasks.jsx); not while editing
// or while a row transaction runs.
export default function TaskRow({
  number,
  item,
  whenType,
  done,
  busy,
  locked,
  onChange,
  onComplete,
  onDelete,
}) {
  const [editing, setEditing] = useState(false)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: editing || locked })
  const field = whenType === 'time' ? 'time' : 'targetDate'
  const when = item[field]
  const blank = !item.task.trim()

  const startEdit = () => setEditing(true)
  const finishEdit = () => setEditing(false)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`pl-task${done ? ' is-done' : ''}${editing ? ' is-editing' : ''}${
        isDragging ? ' is-dragging' : ''
      }`}
      aria-busy={busy || undefined}
    >
      <Checkbox
        checked={done}
        onClick={onComplete}
        disabled={locked || blank}
        label={done ? 'Completing…' : 'Mark complete'}
      />
      <span className="pl-num">{number}</span>

      {!editing && (
        <span
          className="pl-when"
          title={whenType === 'date' && when ? `Target ${formatShortDate(when)}` : undefined}
        >
          {whenType === 'date' && when ? compactDate(when) : when}
        </span>
      )}

      <div className="pl-task-body">
        {editing ? (
          <>
            <TaskEditor
              value={item.task}
              onChange={(task) => onChange({ task })}
              onDone={finishEdit}
            />
            <div className="pl-edit-row">
              {whenType === 'time' ? (
                <TimeSelect value={when} onChange={(time) => onChange({ time })} label="Time" />
              ) : (
                <input
                  type="date"
                  className="pl-when-input"
                  value={when}
                  onChange={(e) => onChange({ targetDate: e.target.value })}
                  aria-label="Target date"
                />
              )}
              <button type="button" className="pl-btn pl-btn-sm" onClick={finishEdit}>
                Done
              </button>
            </div>
          </>
        ) : (
          <p className="pl-task-text" onClick={() => !busy && startEdit()}>
            {blank ? <span className="pl-untitled">Untitled task</span> : item.task}
          </p>
        )}
      </div>

      {!editing && (
        <div className="pl-task-actions">
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="pl-act pl-grip"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            title="Drag to reorder"
          >
            <PlannerIcon name="grip" />
          </button>
          <RowAction icon="edit" label="Edit" onClick={startEdit} disabled={busy} />
          <RowAction
            icon="trash"
            label="Delete (move to Recycle Bin)"
            onClick={onDelete}
            disabled={locked}
            danger
          />
        </div>
      )}
    </li>
  )
}

// Auto-growing text box for the task while editing (long Chinese / English
// text wraps instead of scrolling sideways).
function TaskEditor({ value, onChange, onDone }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      className="pl-task-input"
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === 'Escape') && !isComposing(e)) {
          e.preventDefault()
          onDone()
        }
      }}
      onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
      placeholder="Task"
      aria-label="Task"
      autoFocus
    />
  )
}
