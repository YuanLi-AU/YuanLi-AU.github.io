import { addDays, formatLongDate, toDateKey } from '../../lib/dates.js'

export default function DateNavigator({ dateKey, onChange }) {
  const isToday = dateKey === toDateKey()

  return (
    <nav className="pl-datenav" aria-label="Choose day">
      <button type="button" className="pl-btn" onClick={() => onChange(addDays(dateKey, -1))}>
        ‹ <span className="pl-hide-sm">Previous</span>
      </button>

      <div className="pl-datenav-center">
        <p className="pl-datenav-date" aria-live="polite">
          {formatLongDate(dateKey)}
        </p>
        <button
          type="button"
          className="pl-link"
          onClick={() => onChange(toDateKey())}
          disabled={isToday}
        >
          {isToday ? 'Today' : 'Back to today'}
        </button>
      </div>

      <button type="button" className="pl-btn" onClick={() => onChange(addDays(dateKey, 1))}>
        <span className="pl-hide-sm">Next</span> ›
      </button>
    </nav>
  )
}
