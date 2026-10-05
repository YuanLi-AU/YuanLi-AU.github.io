// Planner data access (Firestore). Schema:
//
//   users/{uid}/dailyPlans/{YYYY-MM-DD}       active rows for one day
//     date:      "2026-10-06"
//     items:     [{ id, time, task, notes }]   // time may be ""
//     updatedAt: server timestamp
//
//   users/{uid}/plans/{midTerm | longTerm}     active mid/long-term plans
//     items:     [{ id, targetDate, task, notes }]   // targetDate may be ""
//     updatedAt: server timestamp
//
//   users/{uid}/completedHistory/{itemId}     one doc per completed row
//     id, type ("daily" | "mid-term" | "long-term"), task, notes,
//     originalDate (daily: the plan date; otherwise null),
//     time (daily) or targetDate (mid/long), completedAt: server timestamp
//
//   users/{uid}/settings/planner
//     importantDateLabel, importantDate, updatedAt
//
// The uid always comes from the signed-in Firebase user; firestore.rules
// decide whether that uid is allowed. Nothing else (email, password) is stored.
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
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
const settingsRef = () => userDoc('settings', 'planner')

// Keep only the current fields. Older test data may still contain
// `priority` / `done`; they are ignored here and dropped on the next save.
const normalize = (items) =>
  items.map(({ id, time = '', task = '', notes = '' }) => ({ id, time, task, notes }))
const normalizePlan = (items) =>
  items.map(({ id, targetDate = '', task = '', notes = '' }) => ({ id, targetDate, task, notes }))

const itemsOf = (snap) => (snap.exists() ? normalize(snap.data().items ?? []) : [])
const planItemsOf = (snap) => (snap.exists() ? normalizePlan(snap.data().items ?? []) : [])
const settingsOf = (snap) => (snap.exists() ? snap.data() : null)

// Writes a completed row to history and the source list without it, in one
// transaction — both happen or neither does, so completing can't lose a row.
function completeInto(sourceRef, sourceData, entry) {
  return runTransaction(db, async (tx) => {
    tx.set(historyRef(entry.id), { ...entry, completedAt: serverTimestamp() })
    tx.set(sourceRef, { ...sourceData, updatedAt: serverTimestamp() })
  })
}

// ---------- Daily plan ----------

export function createItem() {
  return { id: crypto.randomUUID(), time: '', task: '', notes: '' }
}

export async function getDailyPlan(dateKey) {
  return itemsOf(await getDoc(dailyPlanRef(dateKey)))
}

// Live updates across devices. Returns the unsubscribe function.
export function subscribeDailyPlan(dateKey, onItems, onError) {
  return onSnapshot(dailyPlanRef(dateKey), (snap) => onItems(itemsOf(snap)), onError)
}

// Saves the whole day's list (last write wins — fine for a single user).
export function saveDailyPlan(dateKey, items) {
  return setDoc(dailyPlanRef(dateKey), {
    date: dateKey,
    items: normalize(items),
    updatedAt: serverTimestamp(),
  })
}

// Moves one row from `fromKey` to the end of `toKey`, in a single transaction:
// both days are written together or not at all, so a failure can never lose
// the row. `remaining` is the from-day list without the row (it may include
// edits not yet auto-saved). If the target day already has a row with the same
// id, it is not added again — the row is only removed from the from-day.
export function moveItem(fromKey, toKey, item, remaining) {
  return runTransaction(db, async (tx) => {
    const toRef = dailyPlanRef(toKey)
    const toItems = itemsOf(await tx.get(toRef))
    const alreadyThere = toItems.some((existing) => existing.id === item.id)
    tx.set(toRef, {
      date: toKey,
      items: normalize(alreadyThere ? toItems : [...toItems, item]),
      updatedAt: serverTimestamp(),
    })
    tx.set(dailyPlanRef(fromKey), {
      date: fromKey,
      items: normalize(remaining),
      updatedAt: serverTimestamp(),
    })
    return { added: !alreadyThere }
  })
}

export function completeDailyItem(dateKey, item, remaining) {
  return completeInto(
    dailyPlanRef(dateKey),
    { date: dateKey, items: normalize(remaining) },
    {
      id: item.id,
      type: 'daily',
      task: item.task,
      notes: item.notes,
      time: item.time,
      originalDate: dateKey,
    },
  )
}

// ---------- Mid-term / long-term plans ----------

export const PLAN_TYPES = { midTerm: 'mid-term', longTerm: 'long-term' }

export function createPlanItem() {
  return { id: crypto.randomUUID(), targetDate: '', task: '', notes: '' }
}

export function subscribePlan(planId, onItems, onError) {
  return onSnapshot(planRef(planId), (snap) => onItems(planItemsOf(snap)), onError)
}

export function savePlan(planId, items) {
  return setDoc(planRef(planId), { items: normalizePlan(items), updatedAt: serverTimestamp() })
}

export function completePlanItem(planId, item, remaining) {
  return completeInto(
    planRef(planId),
    { items: normalizePlan(remaining) },
    {
      id: item.id,
      type: PLAN_TYPES[planId],
      task: item.task,
      notes: item.notes,
      targetDate: item.targetDate,
      originalDate: null,
    },
  )
}

// ---------- Restore from history ----------

const PLAN_IDS = { 'mid-term': 'midTerm', 'long-term': 'longTerm' }

// Puts a completed row back into its active list and removes the history
// record, in one transaction (both or neither — a failure leaves history
// intact and the active list unchanged). Daily rows go back to `todayKey`
// (the user's local today), not their original date. If the active list
// already has a row with the same id, it is not added again; the history
// record is still removed, so nothing is duplicated.
export function restoreHistoryItem(itemId, todayKey) {
  return runTransaction(db, async (tx) => {
    const histRef = historyRef(itemId)
    const histSnap = await tx.get(histRef)
    if (!histSnap.exists()) return { destination: null } // already restored elsewhere
    const entry = histSnap.data()

    const isDaily = entry.type === 'daily'
    const planId = PLAN_IDS[entry.type]
    if (!isDaily && !planId) throw new Error(`Unknown history type: ${entry.type}`)

    const targetRef = isDaily ? dailyPlanRef(todayKey) : planRef(planId)
    const targetSnap = await tx.get(targetRef)
    const items = isDaily ? itemsOf(targetSnap) : planItemsOf(targetSnap)
    const row = isDaily
      ? { id: entry.id, time: entry.time ?? '', task: entry.task, notes: entry.notes }
      : { id: entry.id, targetDate: entry.targetDate ?? '', task: entry.task, notes: entry.notes }

    if (!items.some((item) => item.id === entry.id)) {
      if (isDaily) {
        tx.set(targetRef, {
          date: todayKey,
          items: normalize([...items, row]),
          updatedAt: serverTimestamp(),
        })
      } else {
        tx.set(targetRef, { items: normalizePlan([...items, row]), updatedAt: serverTimestamp() })
      }
    }
    tx.delete(histRef)
    // `key` matches the table's useSyncedItems key (a date, or the plan id).
    return { destination: isDaily ? 'daily' : planId, key: isDaily ? todayKey : planId, row }
  })
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
