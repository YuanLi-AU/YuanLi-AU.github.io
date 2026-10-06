// Small components shared by the planner lists.
import PlannerIcon from './PlannerIcons.jsx'
import { useUndo } from './useUndo.js'

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

// Quiet icon button for row actions (edit / move / delete).
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

// Short status line under a list (e.g. "Moved to Recycle Bin. Undo").
// "Undo" is the same one-level undo as the top ↶ button, shown only while
// this message's action is still the latest undoable one.
export function Message({ message }) {
  const undo = useUndo()
  const canUndo = message?.undoId && undo?.entry?.id === message.undoId
  return (
    <p className="pl-message" role="status">
      {message?.text}
      {canUndo && (
        <button type="button" className="pl-link" onClick={undo.undo} disabled={undo.busy}>
          Undo
        </button>
      )}
    </p>
  )
}

// ↶ Undo last action (top bar). Muted and disabled when there is nothing to undo.
export function UndoButton() {
  const undo = useUndo()
  const label = undo.entry
    ? `Undo last action: ${undo.entry.label}`
    : 'Undo last action (nothing to undo)'
  return (
    <button
      type="button"
      className="pl-undo"
      onClick={undo.undo}
      disabled={!undo.entry || undo.busy}
      aria-label={label}
      title={label}
    >
      <PlannerIcon name="undo" size={18} />
    </button>
  )
}

const TYPE_LABELS = { daily: 'Daily', 'mid-term': 'Mid-term', 'long-term': 'Long-term' }

export function TypeLabel({ type }) {
  return <span className={`pl-type is-${type}`}>{TYPE_LABELS[type] ?? ''}</span>
}
