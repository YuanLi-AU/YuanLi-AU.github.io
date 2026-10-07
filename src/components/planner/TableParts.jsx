// Small components shared by the planner lists.
import PlannerIcon from './PlannerIcons.jsx'

export function SaveStatus({ state, onRetry }) {
  if (state === 'saving') return <span className="pl-save">Saving…</span>
  if (state === 'saved') return <span className="pl-save">Saved</span>
  if (state === 'error')
    return (
      <span className="pl-save is-error" role="alert">
        Couldn’t save — your changes are still here.{' '}
        <button type="button" className="pl-link" onClick={onRetry}>
          Retry
        </button>
      </span>
    )
  return null
}

// Round checkbox at the start of every task: click = complete (active
// lists) or restore (completed history).
export function Checkbox({ checked, onClick, disabled, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="pl-checkbox"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <span className="pl-box">
        <PlannerIcon name="check" size={14} />
      </span>
    </button>
  )
}

// Quiet icon button for row actions (edit / delete).
export function RowAction({ icon, label, text, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      className={`pl-act${danger ? ' is-danger' : ''}${text ? ' has-text' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <PlannerIcon name={icon} />
      {text && <span>{text}</span>}
    </button>
  )
}

// Short status line under a list (e.g. "Moved to Recycle Bin.").
export function Message({ message }) {
  return (
    <p className="pl-message" role="status">
      {message?.text}
    </p>
  )
}

// Daily time in 30-minute steps (00:00 … 23:30), or none. A saved time off
// that grid (e.g. an older 08:10) is kept as an extra option in its place,
// so it still shows and nothing changes unless a new time is picked.
const HALF_HOURS = Array.from(
  { length: 48 },
  (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
)

export function TimeSelect({ value, onChange, label, disabled }) {
  const times = value && !HALF_HOURS.includes(value) ? [...HALF_HOURS, value].sort() : HALF_HOURS
  return (
    <select
      className="pl-when-input pl-time-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      title={label}
      disabled={disabled}
    >
      <option value="">--:--</option>
      {times.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  )
}

const TYPE_LABELS = { daily: 'Daily', 'mid-term': 'Mid-term', 'long-term': 'Long-term' }

export function TypeLabel({ type }) {
  return <span className={`pl-type is-${type}`}>{TYPE_LABELS[type] ?? ''}</span>
}
