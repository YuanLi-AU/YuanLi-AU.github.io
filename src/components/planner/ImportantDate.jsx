import { useEffect, useState } from 'react'
import { countdownParts, formatShortDate } from '../../lib/dates.js'
import { savePlannerSettings, subscribePlannerSettings } from '../../lib/plannerData.js'

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

// The current time, refreshed at the start of every minute (and straight
// away when the app comes back to the foreground), so the countdown's
// minutes tick over without showing seconds.
function useMinuteClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer
    const tick = () => {
      const current = new Date()
      setNow(current)
      const msToNextMinute = 60000 - (current.getSeconds() * 1000 + current.getMilliseconds())
      timer = setTimeout(tick, msToNextMinute + 50)
    }
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      clearTimeout(timer)
      tick()
    }
    tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return now
}

// One important date with a live countdown, stored in users/{uid}/settings/planner
// as { importantDateLabel, importantDate: "YYYY-MM-DD" }. The countdown runs
// to the start (00:00 local) of that date.
//   距离「毕业」还有
//   35 天 18 小时 26 分钟
export default function ImportantDate() {
  const [settings, setSettings] = useState(undefined) // undefined = loading
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const now = useMinuteClock()

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
          placeholder="事件名称，例如：毕业"
          aria-label="Event name"
          maxLength={60}
          required
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
          <button
            type="submit"
            className="pl-btn pl-btn-primary"
            disabled={saving || !date || !label.trim()}
          >
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

  const title = settings.importantDateLabel || 'Important date'
  const left = countdownParts(savedDate, now)

  return (
    <div className="pl-countdown">
      <div lang="zh-Hans">
        <p className="pl-cd-label">
          {left.daysAgo === undefined ? `距离「${title}」还有` : `「${title}」`}
          <span className="pl-cd-date" lang="en">
            {' '}
            · {formatShortDate(savedDate)}
          </span>
        </p>
        {left.daysAgo === undefined ? (
          <p className="pl-cd-value">
            <span className="pl-cd-part is-days">
              <span className="pl-cd-num">{left.days}</span> 天
            </span>
            <span className="pl-cd-part">
              <span className="pl-cd-num">{left.hours}</span> 小时
            </span>
            <span className="pl-cd-part">
              <span className="pl-cd-num">{left.minutes}</span> 分钟
            </span>
          </p>
        ) : (
          <p className="pl-cd-value">
            {left.daysAgo === 0 ? '就是今天' : `已经过去 ${left.daysAgo} 天`}
          </p>
        )}
      </div>
      <button type="button" className="pl-link" onClick={startEdit}>
        Edit
      </button>
    </div>
  )
}
