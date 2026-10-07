import { useRef, useState } from 'react'
import PlannerIcon from './PlannerIcons.jsx'

// "Add a task" line under each list: task text, plus an optional target date
// for Mid-term / Long-term (`whenType="date"`); Daily has none, so it is
// a single line: [ Add a task… ] [ Add ]. Nothing is written until Add / Enter.
export default function AddTaskForm({ whenType, onAdd, disabled }) {
  const [task, setTask] = useState('')
  const [when, setWhen] = useState('')
  const input = useRef(null)

  function submit(e) {
    e.preventDefault()
    const text = task.trim()
    if (!text) return
    onAdd(text, when)
    setTask('')
    setWhen('')
    input.current.focus()
  }

  return (
    <form className={`pl-add${whenType ? '' : ' is-single'}`} onSubmit={submit}>
      <span className="pl-add-icon" aria-hidden="true">
        <PlannerIcon name="plus" size={18} />
      </span>
      <input
        ref={input}
        type="text"
        className="pl-add-task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add a task"
        aria-label="New task"
        disabled={disabled}
        enterKeyHint="done"
      />
      <div className="pl-add-row">
        {whenType === 'date' && (
          <input
            type="date"
            className="pl-when-input"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            aria-label="Target date (optional)"
            title="Target date (optional)"
            disabled={disabled}
          />
        )}
        <button type="submit" className="pl-btn pl-btn-add" disabled={disabled || !task.trim()}>
          Add
        </button>
      </div>
    </form>
  )
}
