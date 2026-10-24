import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useLayoutEffect, useRef, useState } from 'react'
import { formatShortDate, fromDateKey } from '../../lib/dates.js'
import { DUE_TIMES, isDueTime } from '../../lib/plannerData.js'
import { daysLeft, timeLeft, useMinuteClock } from './dueCountdown.js'
import PlannerIcon from './PlannerIcons.jsx'
import { Checkbox, RowAction } from './TableParts.jsx'

// Enter / Escape finish editing — but not while an IME (e.g. Chinese
// input) is still composing, where Enter only confirms the characters.
const isComposing = (e) => e.nativeEvent.isComposing || e.keyCode === 229

const isDateKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '')

// "15 Nov 2026". Always 3-letter months (en-AU would write "June" /
// "Sept"), so the Due stays narrow.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function dueDate(dateKey) {
  const date = fromDateKey(dateKey)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// One task in Daily / Mid-term / Long-term, on one line:
//
//   ( )  A   Task text (wraps naturally)          Due 19:00   🗑     Daily
//                                          剩余 3 小时 20 分
//   ( )  1   Task text (wraps naturally)    Due 15 Nov 2026   🗑     Mid / Long
//                                                 剩余 22 天
// (On phones a set Due, with its countdown, goes under the task text.)
//
// `number` is the row's label (A, B, … for Daily; 1, 2, … otherwise) and is
// also the drag handle — to reorder, or onto another list's tab to move the
// task there (mouse, touch or keyboard; see SortableTasks.jsx); not while
// editing or while a row transaction runs. Clicking it does nothing else.
// Clicking the task text (or Enter / Space on it) edits it.
// The optional Due sits before 🗑: a time (Daily, `dueType="time"`, every
// 30 minutes) or a date (Mid / Long, `dueType="date"`, stored as targetDate).
// Nothing is shown for it until it is set, except a quiet icon to set it.
// A Daily due time is only shown — it never moves, completes or removes the
// task. `done` shows the completed look while the complete transaction runs;
// the row then moves to Completed History. Edits are saved by the list's
// auto-save. (An older saved Daily `time` is kept untouched.)
export default function TaskRow({
  number,
  item,
  dueType,
  done,
  busy,
  locked,
  onChange,
  onComplete,
  onDelete,
}) {
  const [editing, setEditing] = useState(null) // null | 'task' | 'date'
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: Boolean(editing) || locked })
  const blank = !item.task.trim()

  const startEdit = (focus = 'task') => !busy && setEditing(focus)
  const finishEdit = () => setEditing(null)

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
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="pl-num"
        {...attributes}
        {...listeners}
        aria-label={`${number}. Drag to reorder, or onto another list’s tab to move`}
        title="Drag to reorder, or onto a tab to move"
      >
        {number}
      </button>

      <div className="pl-task-body">
        {editing ? (
          <>
            <TaskEditor
              value={item.task}
              onChange={(task) => onChange({ task })}
              onDone={finishEdit}
              autoFocus={editing === 'task'}
            />
            <div className="pl-edit-row">
              {dueType === 'date' && (
                <DueDateInput
                  value={item.targetDate}
                  onChange={(targetDate) => onChange({ targetDate })}
                  onDone={finishEdit}
                  autoFocus={editing === 'date'}
                />
              )}
              <button type="button" className="pl-btn pl-btn-sm" onClick={finishEdit}>
                Done
              </button>
            </div>
          </>
        ) : (
          <p
            className="pl-task-text"
            role="button"
            tabIndex={busy ? -1 : 0}
            onClick={() => startEdit()}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return
              e.preventDefault()
              startEdit()
            }}
            aria-label={`Edit task: ${blank ? 'Untitled task' : item.task}`}
          >
            {blank ? <span className="pl-untitled">Untitled task</span> : item.task}
          </p>
        )}
      </div>

      {!editing && (
        <div className="pl-task-actions">
          {dueType === 'time' && (
            <DueTime value={item.dueTime} onChange={(dueTime) => onChange({ dueTime })} disabled={busy} />
          )}
          {dueType === 'date' && (
            <DueDate value={item.targetDate} onClick={() => startEdit('date')} disabled={busy} />
          )}
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

// "Due" (small, quiet) + the time / date.
// Under it, smaller and quieter, the time / days left (dueCountdown.js).
function DueText({ value, left }) {
  return (
    <span className="pl-due-stack">
      <span className="pl-due-text">
        <span className="pl-due-label">Due</span> {value}
      </span>
      <span className={`pl-due-left is-${left.tone}`}>{left.text}</span>
    </span>
  )
}

function DueTimeText({ value }) {
  const now = useMinuteClock()
  return <DueText value={value} left={timeLeft(value, now)} />
}

function DueDateText({ value }) {
  const now = useMinuteClock()
  return <DueText value={dueDate(value)} left={daysLeft(value, now)} />
}

// What is shown under the pointer while a row is dragged: its label and
// the start of the task (the row itself stays in its list, faded).
export function DragChip({ number, task }) {
  return (
    <div className="pl-drag-chip">
      <span className="pl-drag-chip-num">{number}</span>
      <span className="pl-drag-chip-text">{task.trim() || 'Untitled task'}</span>
    </div>
  )
}

// Daily due time: the time ("19:00") with the time left under it, or a
// quiet clock icon when none is set. A native list sits invisibly on top,
// so a click / tap opens the device's own picker: "No due time" (clears
// it), 09:00, 10:00 … 23:00. A time saved before (e.g. 08:30) that is no
// longer offered stays in the list, in its place, until another is chosen.
function DueTime({ value, onChange, disabled }) {
  const set = isDueTime(value)
  const times = set && !DUE_TIMES.includes(value) ? [...DUE_TIMES, value].sort() : DUE_TIMES
  return (
    <span className={`pl-act pl-due${set ? ' has-value' : ''}`} title={set ? `Due ${value}` : 'Set due time'}>
      {set ? <DueTimeText value={value} /> : <PlannerIcon name="clock" size={16} />}
      <select
        className="pl-due-select"
        value={set ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={set ? `Due time ${value}. Change or clear` : 'Set due time'}
      >
        <option value="">No due time</option>
        {times.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </span>
  )
}

// Mid / Long due date: the date ("15 Nov 2026") with the days left under
// it, or a quiet calendar icon when none is set. A click opens the row's editor on the date, with Clear.
function DueDate({ value, onClick, disabled }) {
  const set = isDateKey(value)
  const label = set ? `Due ${formatShortDate(value)}` : 'Set due date'
  return (
    <button
      type="button"
      className={`pl-act pl-due${set ? ' has-value' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={set ? `${label}. Change or clear` : label}
      title={label}
    >
      {set ? <DueDateText value={value} /> : <PlannerIcon name="calendar" size={16} />}
    </button>
  )
}

// Due date while editing: the date field (its calendar opens straight away
// when the Due was clicked) and Clear.
function DueDateInput({ value, onChange, onDone, autoFocus }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!autoFocus) return
    const el = ref.current
    el.focus()
    try {
      el.showPicker?.()
    } catch {
      // not allowed here (e.g. no user gesture): the field is focused anyway
    }
  }, [autoFocus])

  return (
    <>
      <input
        ref={ref}
        type="date"
        className="pl-when-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            onDone()
          }
        }}
        aria-label="Due date"
      />
      {value && (
        <button type="button" className="pl-btn pl-btn-sm" onClick={() => onChange('')}>
          Clear
        </button>
      )}
    </>
  )
}

// Auto-growing text box for the task while editing (long Chinese / English
// text wraps instead of scrolling sideways).
function TaskEditor({ value, onChange, onDone, autoFocus }) {
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
      autoFocus={autoFocus}
    />
  )
}
