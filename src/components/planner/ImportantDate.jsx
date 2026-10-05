import { useEffect, useState } from 'react'
import { countdownText, daysBetween, formatShortDate, toDateKey } from '../../lib/dates.js'
import { savePlannerSettings, subscribePlannerSettings } from '../../lib/plannerData.js'

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

// One important date with a live countdown, stored in users/{uid}/settings/planner.
export default function ImportantDate() {
  const [settings, setSettings] = useState(undefined) // undefined = loading
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(
    () =>
      subscribePlannerSettings(setSettings, () => {
        setSettings(null)
        setError('Couldn’t load the important date.')
      }),
    [],
  )

  const savedDate = settings?.importantDate
  const hasDate = typeof savedDate === 'string' && DATE_KEY.test(savedDate)

  function startEdit() {
    setLabel(settings?.importantDateLabel ?? '')
    setDate(hasDate ? savedDate : '')
    setError('')
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!DATE_KEY.test(date) || saving) return
    setSaving(true)
    setError('')
    try {
      await savePlannerSettings({
        importantDateLabel: label.trim() || 'Important date',
        importantDate: date,
      })
      setEditing(false)
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (settings === undefined) return <div className="pl-countdown is-empty" aria-hidden="true" />

  if (editing) {
    return (
      <form className="pl-countdown pl-countdown-form" onSubmit={handleSave}>
        <input
          type="text"
          className="pl-cd-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Important date name"
          aria-label="Important date name"
          maxLength={60}
          autoFocus
        />
        <input
          type="date"
          className="pl-cd-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Important date"
          required
        />
        <div className="pl-cd-buttons">
          <button type="submit" className="pl-btn pl-btn-primary" disabled={saving || !date}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="pl-btn" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
        {error && (
          <p className="pl-error" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  if (!hasDate) {
    return (
      <div className="pl-countdown is-empty">
        <button type="button" className="pl-link" onClick={startEdit}>
          Set important date
        </button>
        {error && <span className="pl-error">{error}</span>}
      </div>
    )
  }

  const days = daysBetween(toDateKey(), savedDate)

  return (
    <div className="pl-countdown">
      <div>
        <p className="pl-cd-label">
          {settings.importantDateLabel || 'Important date'}
          <span className="pl-cd-date"> · {formatShortDate(savedDate)}</span>
        </p>
        <p className="pl-cd-value">{countdownText(days)}</p>
      </div>
      <button type="button" className="pl-link" onClick={startEdit}>
        Edit
      </button>
    </div>
  )
}
