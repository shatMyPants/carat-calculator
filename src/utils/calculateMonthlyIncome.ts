import incomeData from '../../income.json'
import type { IncomeSelections, PvpEvent } from '../types'
import { getAcceleration, jpToEn } from './dateProjection'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Count how many PvP events of each type fall within a given month range. */
function countPvpEventsInMonth(
  pvpEvents: PvpEvent[],
  monthStart: number,
  monthEnd: number,
): { cm: number; loh: number } {
  let cm = 0
  let loh = 0
  const accel = getAcceleration()
  for (const e of pvpEvents) {
    const enStart = e.en_start ?? jpToEn(e.jp_start, accel)
    const enEnd = e.en_end ?? jpToEn(e.jp_end, accel)
    // An event overlaps the month if its start is before month end AND its end is after month start
    if (enStart < monthEnd && enEnd > monthStart) {
      if (e.type === 'cm') cm++
      else if (e.type === 'loh') loh++
    }
  }
  return { cm, loh }
}

/** Get month boundaries (unix timestamps) for a given month offset from "now". */
function getMonthBounds(monthOffset: number): { start: number; end: number } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset
  const start = new Date(year, month, 1).getTime() / 1000
  const end = new Date(year, month + 1, 1).getTime() / 1000
  return { start, end }
}

/* ------------------------------------------------------------------ */
/*  Main calculation                                                  */
/* ------------------------------------------------------------------ */

export interface MonthlyIncomeResult {
  carats: number
  tickets: number
  breakdown: { label: string; carats: number; tickets: number }[]
}

export function calculateMonthlyIncome(
  selections: IncomeSelections,
  pvpEvents: PvpEvent[],
): MonthlyIncomeResult {
  const breakdown: { label: string; carats: number; tickets: number }[] = []
  let totalCarats = 0
  let totalTickets = 0

  // --- Team Trial (weekly) ---
  // Multiplied by 4 weeks per month (simplified)
  // TODO: consider using 4.33 for a more accurate monthly average
  const teamTrialKey = selections.team_trial_weekly
  if (teamTrialKey) {
    const weeklyCarats =
      (incomeData.free_income.team_trial_weekly as Record<string, number>)[teamTrialKey] ?? 0
    const monthly = weeklyCarats * 4
    breakdown.push({ label: `Team Trial (${teamTrialKey})`, carats: monthly, tickets: 0 })
    totalCarats += monthly
  }

  // --- Club Rank (monthly) ---
  const clubKey = selections.club_rank_monthly
  if (clubKey) {
    const entry = (incomeData.free_income.club_rank_monthly as Record<string, { carats: number; info: string }>)[clubKey]
    if (entry) {
      breakdown.push({ label: `Club Rank (${clubKey})`, carats: entry.carats, tickets: 0 })
      totalCarats += entry.carats
    }
  }

  // --- Champions Meeting (based on jp_pvp.json schedule) ---
  const cmKey = selections.champions_meeting
  if (cmKey) {
    const entry = (incomeData.free_income.champions_meeting as Record<string, { carats: number; tickets: number }>)[cmKey]
    if (entry) {
      // Count how many CMs occur this month based on actual PvP schedule
      const { start, end } = getMonthBounds(0)
      const { cm: cmCount } = countPvpEventsInMonth(pvpEvents, start, end)
      const count = Math.max(cmCount, 1) // At least 1 for estimation
      breakdown.push({
        label: `Champions Meeting ×${count} (${cmKey})`,
        carats: entry.carats * count,
        tickets: entry.tickets * count,
      })
      totalCarats += entry.carats * count
      totalTickets += entry.tickets * count
    }
  }

  // --- League of Heroes (based on jp_pvp.json schedule) ---
  const lohKey = selections.league_of_heroes
  if (lohKey) {
    const entry = (incomeData.free_income.league_of_heroes as Record<string, { carats: number; tickets: number }>)[lohKey]
    if (entry) {
      const { start, end } = getMonthBounds(0)
      const { loh: lohCount } = countPvpEventsInMonth(pvpEvents, start, end)
      const count = Math.max(lohCount, 1) // At least 1 for estimation
      breakdown.push({
        label: `League of Heroes ×${count} (${lohKey})`,
        carats: entry.carats * count,
        tickets: entry.tickets * count,
      })
      totalCarats += entry.carats * count
      totalTickets += entry.tickets * count
    }
  }

  // --- Login Bonus (weekly, ×4) ---
  // TODO: consider using 4.33 for a more accurate monthly average
  const loginTotal = Object.values(incomeData.free_income.login_bonus_weekly).reduce(
    (sum, v) => sum + v,
    0,
  )
  const loginMonthly = loginTotal * 4
  breakdown.push({ label: 'Login Bonus', carats: loginMonthly, tickets: 0 })
  totalCarats += loginMonthly

  // --- Daily Missions (×30) ---
  const dailyMonthly = incomeData.free_income.daily_missions * 30
  breakdown.push({ label: 'Daily Missions', carats: dailyMonthly, tickets: 0 })
  totalCarats += dailyMonthly

  // --- Paid: Daily Carats Pack ---
  if (selections.daily_carats_pack) {
    const pack = incomeData.paid_income.packs['Daily Carats Pack']
    const paidMonthly = pack.paid_upfront + pack.free_daily * 30
    breakdown.push({ label: 'Daily Carats Pack', carats: paidMonthly, tickets: 0 })
    totalCarats += paidMonthly
  }

  return { carats: totalCarats, tickets: totalTickets, breakdown }
}
