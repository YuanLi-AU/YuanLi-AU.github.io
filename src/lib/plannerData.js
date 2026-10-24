// Planner data access (Firestore). Schema:
//
//   users/{uid}/plans/daily                    THE active Daily list
//     items:     [{ id, dueTime, time, task, notes }]
//                // dueTime: optional due time "HH:MM" or "" (new choices are
//                // 09:00 … 23:00 on the hour; older values are kept).
//                // time: the old plan time — no longer shown or asked for,
//                // but older values are kept (as are notes).
//                // Rows moved in from Mid/Long-term also keep
//                // movedFrom ("mid-term" | "long-term") and targetDate.
//     updatedAt: server timestamp
//   A task stays here until it is completed (→ completedHistory) or deleted
//   (→ recycleBin). No rollover, no expiry; a due time never moves it.
//
//   users/{uid}/plans/{midTerm | longTerm}     active mid/long-term plans
//     items:     [{ id, targetDate, task, notes }]
//                // targetDate = the optional Due date ("YYYY-MM-DD" or "").
//                // Once it is today or earlier the row moves to the end of
//                // the Daily list (moveDueToDaily).
//     updatedAt: server timestamp
//
//   users/{uid}/dailyPlans/{YYYY-MM-DD}       LEGACY one-list-per-day Daily
//     data; only read once, by the one-time migration below.
//
//   users/{uid}/completedHistory/{itemId}     one doc per completed row
//     id, type ("daily" | "mid-term" | "long-term"), task, notes,
//     originalDate (daily: the day it was completed; otherwise null),
//     time (daily) or targetDate (mid/long), completedAt: server timestamp
//
//   users/{uid}/recycleBin/{itemId}           one doc per deleted row
//     id, type, task, originalDate (daily) or null, time (daily) or
//     targetDate (mid/long), notes (only if an older row had one),
//     deletedAt: server timestamp
//
//   users/{uid}/settings/planner
//     importantDateLabel, importantDate, updatedAt,
//     dailyMigrated: true once the legacy Daily data has been moved
//
// The uid always comes from the signed-in Firebase user; firestore.rules
// decide whether that uid is allowed. Nothing else (email, password) is stored.
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { addDays, toDateKey } from './dates.js'
import { auth, db } from './firebase.js'

function userPath() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Planner data requires a signed-in user.')
  return ['users', uid]
}

const userDoc = (...path) => doc(db, ...userPath(), ...path)
const dailyPlanRef = (dateKey) => userDoc('dailyPlans', dateKey)
const planRef = (planId) => userDoc('plans', planId)
const historyRef = (itemId) => userDoc('completedHistory', itemId)
const binRef = (itemId) => userDoc('recycleBin', itemId)
const settingsRef = () => userDoc('settings', 'planner')

// Fill in the current fields; any other saved field is kept as it is.
// Older test data may still contain `priority` / `done`; they are ignored
// here and dropped on the next save.
function withoutRetired(item) {
  const rest = { ...item }
  delete rest.priority
  delete rest.done
  return rest
}
const normalize = (items) =>
  items.map((item) => {
    const { id, dueTime = '', time = '', task = '', notes = '', ...rest } = withoutRetired(item)
    return { ...rest, id, dueTime, time, task, notes }
  })
const normalizePlan = (items) =>
  items.map((item) => {
    const { id, targetDate = '', task = '', notes = '', ...rest } = withoutRetired(item)
    return { ...rest, id, targetDate, task, notes }
  })

// ---------- Saving a whole list without losing other devices' changes ----------
// Every list is one document holding the whole list. A device saves its
// local list, but another device (or the due-date move below) may have
// added or removed rows since this device last loaded it. So each save is a
// transaction that reads the current list and merges by row id:
//   local    = this device's list (its order and its text win)
//   base     = the list this device's edits started from
//   remote   = what is stored now
// - a row removed elsewhere (in base, gone from remote) stays removed — so a
//   completed / deleted / moved row is never written back by an older list;
// - a row added elsewhere (not in base, not here) is kept, at the end;
// - rows this device added or removed are added / removed as usual;
// - a row this device did not change takes the stored version, so an edit
//   made on another device is not overwritten by an older copy.
const sameRow = (a, b) =>
  JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort())

export function mergeList(remote, local, base) {
  const baseById = new Map(base.map((item) => [item.id, item]))
  const remoteById = new Map(remote.map((item) => [item.id, item]))
  const localIds = new Set(local.map((item) => item.id))
  const kept = []
  for (const item of local) {
    const stored = remoteById.get(item.id)
    const before = baseById.get(item.id)
    if (!stored) {
      if (!before) kept.push(item) // added here
      continue // removed elsewhere
    }
    kept.push(before && sameRow(item, before) ? stored : item)
  }
  const added = remote.filter((item) => !baseById.has(item.id) && !localIds.has(item.id))
  return [...kept, ...added]
}

// Saves `local` (started from `base`) into `ref`; returns the list written.
function saveMerged(ref, read, clean, local, base) {
  return runTransaction(db, async (tx) => {
    const merged = clean(mergeList(read(await tx.get(ref)), local, base))
    tx.set(ref, { items: merged, updatedAt: serverTimestamp() })
    return merged
  })
}

const itemsOf = (snap) => (snap.exists() ? normalize(snap.data().items ?? []) : [])
const planItemsOf = (snap) => (snap.exists() ? normalizePlan(snap.data().items ?? []) : [])
const settingsOf = (snap) => (snap.exists() ? snap.data() : null)

// Thrown when a row to complete / delete / move was stored but no longer is
// (e.g. another device already completed it, or it moved to Daily).
export const ROW_GONE = 'planner/row-gone'

// A row this device loaded from the stored list (`base`) that is gone from
// it now. A row added here and not saved yet is not "gone".
function checkNotGone(remote, base, id) {
  if (remote.some((item) => item.id === id) || !base.some((item) => item.id === id)) return
  const err = new Error('This row is no longer in the list.')
  err.code = ROW_GONE
  throw err
}

// Writes a row to history (completed) or the Recycle Bin (deleted) and the
// source list without it, in one transaction — both happen or neither does,
// so completing or deleting can't lose a row. The source list is merged
// like a save (see mergeList); returns the list written.
function removeInto(targetRef, stampField, source, entry) {
  const { ref, read, clean, remaining, base } = source
  return runTransaction(db, async (tx) => {
    const remote = read(await tx.get(ref))
    checkNotGone(remote, base, entry.id)
    const merged = clean(mergeList(remote, remaining, base))
    tx.set(targetRef, { ...entry, [stampField]: serverTimestamp() })
    tx.set(ref, { items: merged, updatedAt: serverTimestamp() })
    return merged
  })
}

const completeInto = (source, entry) => removeInto(historyRef(entry.id), 'completedAt', source, entry)
const binInto = (source, entry) => removeInto(binRef(entry.id), 'deletedAt', source, entry)

// Old notes are only kept when there is one, so new entries stay minimal.
const notesOf = (item) => (item.notes ? { notes: item.notes } : {})

const dailyEntry = (dateKey, item) => ({
  id: item.id,
  type: 'daily',
  task: item.task,
  ...notesOf(item),
  time: item.time,
  ...(item.dueTime ? { dueTime: item.dueTime } : {}),
  ...(item.movedFrom ? { movedFrom: item.movedFrom, targetDate: item.targetDate ?? '' } : {}),
  originalDate: dateKey,
})

// ---------- Daily plan (plans/daily) ----------

const DAILY = 'daily' // plan id of the one active Daily list (also its list key)
const dailyRef = () => planRef(DAILY)

export function createItem() {
  return { id: crypto.randomUUID(), dueTime: '', time: '', task: '', notes: '' }
}

// Daily due times to choose from: every hour, 09:00 … 23:00 (24-hour clock).
export const DUE_TIMES = Array.from({ length: 15 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`)

// A saved due time: any "HH:MM". Older rows may hold a time that is no
// longer offered (e.g. 08:30, 19:30); it is shown and kept as it is until
// another time is chosen.
export const isDueTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')

// Live updates across devices. Returns the unsubscribe function. (The key
// argument is the list key from useSyncedItems; Daily has only one list.)
export function subscribeDaily(_key, onItems, onError) {
  return onSnapshot(dailyRef(), (snap) => onItems(itemsOf(snap)), onError)
}

// Saves the whole list, merged with the stored one (see mergeList).
// `base` is the list the local edits started from. Returns the list written.
export function saveDaily(_key, items, base) {
  return saveMerged(dailyRef(), itemsOf, normalize, items, base)
}

const dailySource = (remaining, base) => ({
  ref: dailyRef(),
  read: itemsOf,
  clean: normalize,
  remaining,
  base,
})

// History / bin entries keep the same shape as before: originalDate is the
// day the task was completed / deleted.
export function completeDailyItem(item, remaining, base) {
  return completeInto(dailySource(remaining, base), dailyEntry(toDateKey(), item))
}

// Delete = move to the Recycle Bin (nothing is permanently deleted here).
export function binDailyItem(item, remaining, base) {
  return binInto(dailySource(remaining, base), dailyEntry(toDateKey(), item))
}

// ---------- Moving a row between the active lists ----------
// Daily ⇄ Mid-term ⇄ Long-term (a row dragged onto another list's tab).
// One transaction: the row leaves the source list (merged like a save, so
// other devices' changes there are kept) and is added to the END of the
// target list — same id, task, notes and other kept fields. Not a
// completion: nothing goes to Completed History or the Recycle Bin.
// Due: Daily keeps a time, Mid / Long a date, so
//   Daily → Mid / Long:  the due time is dropped, the Due date starts empty;
//   Mid / Long → Daily:  the Due date is dropped, the due time starts empty
//                        (works at once, whether or not the row is due);
//   Mid ⇄ Long:          the Due date is kept.
// A row no longer in the stored source (e.g. it was just moved to Daily
// because it fell due) is not moved again (ROW_GONE). If the target already
// has the id, it is not added twice. Returns the source list written.
const LIST = {
  daily: { ref: () => dailyRef(), read: itemsOf, clean: normalize },
  midTerm: { ref: () => planRef('midTerm'), read: planItemsOf, clean: normalizePlan },
  longTerm: { ref: () => planRef('longTerm'), read: planItemsOf, clean: normalizePlan },
}

function movedRow(item, from, to) {
  const rest = { ...item }
  for (const key of ['dueTime', 'targetDate', 'movedFrom']) delete rest[key]
  if (to === 'daily') return { ...rest, dueTime: '' }
  return { ...rest, targetDate: from === 'daily' ? '' : (item.targetDate ?? '') }
}

export function moveBetween(from, to, item, remaining, base) {
  const source = LIST[from]
  const target = LIST[to]
  if (!source || !target || from === to) throw new Error(`Cannot move from ${from} to ${to}`)
  return runTransaction(db, async (tx) => {
    const sourceRemote = source.read(await tx.get(source.ref()))
    const targetRemote = target.read(await tx.get(target.ref()))
    checkNotGone(sourceRemote, base, item.id)
    const merged = source.clean(mergeList(sourceRemote, remaining, base))
    tx.set(source.ref(), { items: merged, updatedAt: serverTimestamp() })
    if (!targetRemote.some((row) => row.id === item.id)) {
      tx.set(target.ref(), {
        items: target.clean([...targetRemote, movedRow(item, from, to)]),
        updatedAt: serverTimestamp(),
      })
    }
    return merged
  })
}

// ---------- One-time migration of the legacy per-day Daily data ----------
// Moves the unfinished tasks of the old dailyPlans/{date} documents into
// plans/daily, ONCE. Only these explicit days are read — today−6 … today,
// plus today+1 (the old "Move to tomorrow") — at most 8 single-document
// reads; no collection query, no list permission. Older legacy days are left
// untouched (not migrated, not read).
//
// One transaction: the active list gets the tasks (after any it already
// has, oldest day first, each day's order kept, no duplicate ids), the
// migrated days are emptied, and settings/planner.dailyMigrated = true —
// all or nothing. On failure nothing changes and the next open retries.
// A device that has seen the flag remembers it locally, so later opens
// don't even read settings for it.
const MIGRATED_KEY = 'planner.dailyMigrated'
const LEGACY_DAYS_BACK = 6
const LEGACY_DAYS_AHEAD = 1

function migratedHere() {
  try {
    return localStorage.getItem(MIGRATED_KEY) === auth.currentUser?.uid
  } catch {
    return false
  }
}

function rememberMigrated() {
  try {
    localStorage.setItem(MIGRATED_KEY, auth.currentUser?.uid ?? '')
  } catch {
    // private mode etc.: we'll just check settings again next time
  }
}

let migrating = null // the running migration, shared by overlapping calls

export function migrateLegacyDaily(todayKey = toDateKey()) {
  if (migratedHere()) return Promise.resolve({ destination: null, key: DAILY, rows: [] })
  migrating ??= runMigration(todayKey).finally(() => {
    migrating = null
  })
  return migrating
}

async function runMigration(todayKey) {
  const days = []
  for (let d = -LEGACY_DAYS_BACK; d <= LEGACY_DAYS_AHEAD; d += 1) days.push(addDays(todayKey, d))

  const rows = await runTransaction(db, async (tx) => {
    const settingsSnap = await tx.get(settingsRef())
    if (settingsSnap.exists() && settingsSnap.data().dailyMigrated === true) return null
    const active = itemsOf(await tx.get(dailyRef()))
    const legacy = []
    for (const key of days) legacy.push([key, itemsOf(await tx.get(dailyPlanRef(key)))])

    const seen = new Set(active.map((item) => item.id))
    const moved = []
    for (const [, items] of legacy) {
      for (const item of items) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        moved.push(item)
      }
    }
    for (const [key, items] of legacy) {
      if (items.length === 0) continue
      tx.set(dailyPlanRef(key), { date: key, items: [], updatedAt: serverTimestamp() })
    }
    if (moved.length > 0) {
      tx.set(dailyRef(), { items: normalize([...active, ...moved]), updatedAt: serverTimestamp() })
    }
    tx.set(settingsRef(), { dailyMigrated: true }, { merge: true })
    return moved
  })
  rememberMigrated()
  // Same shape as a restore result, so the Daily list can take the rows in.
  return { destination: rows?.length ? 'daily' : null, key: DAILY, rows: rows ?? [] }
}

// ---------- Mid-term / long-term plans ----------

export const PLAN_TYPES = { midTerm: 'mid-term', longTerm: 'long-term' }

export function createPlanItem() {
  return { id: crypto.randomUUID(), targetDate: '', task: '', notes: '' }
}

export function subscribePlan(planId, onItems, onError) {
  return onSnapshot(planRef(planId), (snap) => onItems(planItemsOf(snap)), onError)
}

export function savePlan(planId, items, base) {
  return saveMerged(planRef(planId), planItemsOf, normalizePlan, items, base)
}

const planSource = (planId, remaining, base) => ({
  ref: planRef(planId),
  read: planItemsOf,
  clean: normalizePlan,
  remaining,
  base,
})

const planEntry = (planId, item) => ({
  id: item.id,
  type: PLAN_TYPES[planId],
  task: item.task,
  ...notesOf(item),
  targetDate: item.targetDate,
  originalDate: null,
})

export function completePlanItem(planId, item, remaining, base) {
  return completeInto(planSource(planId, remaining, base), planEntry(planId, item))
}

export function binPlanItem(planId, item, remaining, base) {
  return binInto(planSource(planId, remaining, base), planEntry(planId, item))
}

// ---------- Due Mid-term / Long-term rows move to Daily ----------
// A row whose Due date (targetDate) is today or earlier (local calendar day)
// leaves its Mid/Long-term list and is added to the END of the Daily list,
// in one transaction: Mid-term rows first, then Long-term, each in list
// order. Same id, task and notes; the Daily due time is left empty, and
// movedFrom / targetDate record where it came from. It is not a completion:
// nothing is written to Completed History or the Recycle Bin.
//
// Safe to run any number of times, on any number of devices at once: the
// transaction re-reads all three lists (Firestore retries it if one changes
// meanwhile), a row already in Daily (same id) is not added again — it is
// only removed from its old list — and when nothing is due nothing is
// written. Returns the rows added to Daily.
const MOVE_FROM = ['midTerm', 'longTerm']

export const isDueBy = (dateKey, todayKey) =>
  /^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? '') && dateKey <= todayKey

export function moveDueToDaily(todayKey = toDateKey()) {
  return runTransaction(db, async (tx) => {
    const daily = itemsOf(await tx.get(dailyRef()))
    const plans = []
    for (const planId of MOVE_FROM) plans.push([planId, planItemsOf(await tx.get(planRef(planId)))])

    const seen = new Set(daily.map((item) => item.id))
    const moved = []
    for (const [planId, items] of plans) {
      const due = items.filter((item) => isDueBy(item.targetDate, todayKey))
      if (due.length === 0) continue
      const stay = items.filter((item) => !isDueBy(item.targetDate, todayKey))
      tx.set(planRef(planId), { items: normalizePlan(stay), updatedAt: serverTimestamp() })
      for (const item of due) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        const { id, targetDate, task, notes, ...rest } = item
        moved.push({ ...rest, id, dueTime: '', time: '', task, notes, movedFrom: PLAN_TYPES[planId], targetDate })
      }
    }
    if (moved.length > 0) {
      tx.set(dailyRef(), { items: normalize([...daily, ...moved]), updatedAt: serverTimestamp() })
    }
    return moved
  })
}

// ---------- Restore (from history or the Recycle Bin) ----------

const PLAN_IDS = { daily: DAILY, 'mid-term': 'midTerm', 'long-term': 'longTerm' }

// Puts a completed / deleted row back into its active list and removes the
// history / bin record, in one transaction (both or neither — a failure
// leaves the record intact and the active list unchanged). Daily rows go back
// to the active Daily list (plans/daily), at the end. If the active list
// already has a row with the same id, it is not added again; the record is
// still removed, so nothing is duplicated.
function restoreEntry(entryRef) {
  return runTransaction(db, async (tx) => {
    const entrySnap = await tx.get(entryRef)
    if (!entrySnap.exists()) return { destination: null } // already restored elsewhere
    const entry = entrySnap.data()

    const isDaily = entry.type === 'daily'
    const planId = PLAN_IDS[entry.type]
    if (!planId) throw new Error(`Unknown entry type: ${entry.type}`)

    const targetRef = planRef(planId)
    const targetSnap = await tx.get(targetRef)
    const items = isDaily ? itemsOf(targetSnap) : planItemsOf(targetSnap)
    const row = isDaily
      ? {
          id: entry.id,
          dueTime: entry.dueTime ?? '',
          time: entry.time ?? '',
          task: entry.task,
          notes: entry.notes ?? '',
          ...(entry.movedFrom
            ? { movedFrom: entry.movedFrom, targetDate: entry.targetDate ?? '' }
            : {}),
        }
      : {
          id: entry.id,
          targetDate: entry.targetDate ?? '',
          task: entry.task,
          notes: entry.notes ?? '',
        }

    if (!items.some((item) => item.id === entry.id)) {
      const next = [...items, row]
      tx.set(targetRef, {
        items: isDaily ? normalize(next) : normalizePlan(next),
        updatedAt: serverTimestamp(),
      })
    }
    tx.delete(entryRef)
    // `key` matches the list's useSyncedItems key (the plan id).
    return { destination: planId, key: planId, row }
  })
}

// Completed History ↩ Restore.
export function restoreHistoryItem(itemId) {
  return restoreEntry(historyRef(itemId))
}

// Recycle Bin Restore.
export function restoreBinItem(itemId) {
  return restoreEntry(binRef(itemId))
}

// ---------- Completed history ----------

// Most recent completions first. `completedAt` is estimated locally until the
// server confirms it, so a just-completed row shows at the top immediately.
export function subscribeHistory(onEntries, onError, max = 50) {
  const q = query(
    collection(db, ...userPath(), 'completedHistory'),
    orderBy('completedAt', 'desc'),
    limit(max),
  )
  return onSnapshot(
    q,
    (snap) => onEntries(snap.docs.map((d) => d.data({ serverTimestamps: 'estimate' }))),
    onError,
  )
}

// How many completed rows history holds right now (Firestore count
// aggregation: 1 read per 1000 rows counted; nothing is stored).
export async function countHistory() {
  const snap = await getCountFromServer(collection(db, ...userPath(), 'completedHistory'))
  return snap.data().count
}

// ---------- Recycle Bin ----------

// Most recently deleted first (same estimate trick as history).
export function subscribeBin(onEntries, onError, max = 50) {
  const q = query(
    collection(db, ...userPath(), 'recycleBin'),
    orderBy('deletedAt', 'desc'),
    limit(max),
  )
  return onSnapshot(
    q,
    (snap) => onEntries(snap.docs.map((d) => d.data({ serverTimestamps: 'estimate' }))),
    onError,
  )
}

// The only permanent delete in the Planner (after the user confirms).
export function deleteBinItem(itemId) {
  return deleteDoc(binRef(itemId))
}

// ---------- Settings (important date countdown) ----------

export async function getPlannerSettings() {
  return settingsOf(await getDoc(settingsRef()))
}

export function subscribePlannerSettings(onSettings, onError) {
  return onSnapshot(settingsRef(), (snap) => onSettings(settingsOf(snap)), onError)
}

export function savePlannerSettings({ importantDateLabel, importantDate }) {
  return setDoc(
    settingsRef(),
    { importantDateLabel, importantDate, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
