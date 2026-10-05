// Small components shared by the planner tables.

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

// Status column: an empty circle; click to complete (shows ✓ on hover/focus).
export function CompleteButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      className="pl-icon-btn pl-complete"
      onClick={onClick}
      disabled={disabled}
      title="Complete"
      aria-label="Mark complete"
    >
      <span className="pl-check" aria-hidden="true">
        ✓
      </span>
    </button>
  )
}

export function DeleteButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      className="pl-icon-btn pl-delete"
      onClick={onClick}
      disabled={disabled}
      title="Delete row"
      aria-label="Delete row"
    >
      ×
    </button>
  )
}

// Short status line under a table (e.g. "Row deleted. Undo").
export function Message({ message }) {
  return (
    <p className="pl-message" role="status">
      {message?.text}
      {message?.undo && (
        <button type="button" className="pl-link" onClick={message.undo}>
          Undo
        </button>
      )}
    </p>
  )
}
