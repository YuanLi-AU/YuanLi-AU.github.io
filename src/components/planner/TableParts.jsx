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

const TYPE_LABELS = { daily: 'Daily', 'mid-term': 'Mid-term', 'long-term': 'Long-term' }

export function TypeLabel({ type }) {
  return <span className={`pl-type is-${type}`}>{TYPE_LABELS[type] ?? ''}</span>
}
