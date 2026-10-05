import { CompleteButton, DeleteButton } from './TableParts.jsx'

// One daily row: Time | Task | Note | Status (✓) | Actions (→ ×).
// Desktop: a table row; mobile: a compact stacked row (CSS).
export default function DailyTaskRow({
  item,
  onChange,
  onComplete,
  onMove,
  onDelete,
  busy,
  actionsDisabled,
  autoFocus,
}) {
  return (
    <li className="pl-row" aria-busy={busy || undefined}>
      <input
        type="time"
        className="pl-field pl-when"
        value={item.time}
        onChange={(e) => onChange({ time: e.target.value })}
        aria-label="Time"
      />
      <input
        type="text"
        className="pl-field pl-task"
        value={item.task}
        onChange={(e) => onChange({ task: e.target.value })}
        placeholder="Task"
        aria-label="Task"
        autoFocus={autoFocus}
      />
      <input
        type="text"
        className="pl-field pl-notes"
        value={item.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Note"
        aria-label="Note"
      />
      <div className="pl-status">
        <CompleteButton onClick={onComplete} disabled={actionsDisabled || !item.task.trim()} />
      </div>
      <div className="pl-row-actions">
        <button
          type="button"
          className="pl-icon-btn pl-move"
          onClick={onMove}
          disabled={actionsDisabled}
          title="Move to tomorrow"
          aria-label="Move to tomorrow"
        >
          →
        </button>
        <DeleteButton onClick={onDelete} disabled={busy} />
      </div>
    </li>
  )
}
