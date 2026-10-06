import { useLayoutEffect, useRef, useState } from 'react'
import { formatShortDate, fromDateKey } from '../../lib/dates.js'
import { Checkbox, RowAction } from './TableParts.jsx'

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
//   ( )  1   09:00    Task text (wraps naturally)               ✎  🗑
//
// `whenType` is "time" (daily) or "date" (mid/long-term target). `done`
// shows the completed look while the complete transaction runs; the row then
// moves to Completed History. Edits are saved by the list's auto-save.
export default function TaskRow({
  number,
  item,
  whenType,
  done,
  busy,
  locked,
  onChange,
  onEditDone,
  onComplete,
  onDelete,
}) {
  const [editing, setEditing] = useState(false)
  const before = useRef(null) // the row's fields when editing started (for Undo)
  const field = whenType === 'time' ? 'time' : 'targetDate'
  const when = item[field]
  const blank = !item.task.trim()

  // The edit becomes undoable as soon as it changes something (edits are
  // auto-saved while typing), so ↶ works even before Done is pressed.
  const reported = useRef(false)

  function startEdit() {
    before.current = { task: item.task, [field]: item[field] }
    reported.current = false
    setEditing(true)
  }

  function editChange(patch) {
    onChange(patch)
    if (before.current && !reported.current) {
      reported.current = true
      onEditDone?.(before.current)
    }
  }

  function finishEdit() {
    setEditing(false)
    before.current = null
  }

  return (
    <li
      className={`pl-task${done ? ' is-done' : ''}${editing ? ' is-editing' : ''}`}
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
              onChange={(task) => editChange({ task })}
              onDone={finishEdit}
            />
            <div className="pl-edit-row">
              <input
                type={whenType}
                className="pl-when-input"
                value={when}
                onChange={(e) => editChange({ [field]: e.target.value })}
                aria-label={whenType === 'time' ? 'Time' : 'Target date'}
              />
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
