import type { IncomeSelections, JpEvent, PvpEvent, BreakdownItem, CaratGainResult } from '../types'
import { getAcceleration, jpToEn } from './dateProjection'

// Re-export types for backward compat
export type { JpEvent, PvpEvent, BreakdownItem, CaratGainResult }

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Count how many 1st-of-the-month boundaries fall within (nowSec, endSec].
 * Each represents one club rank payout.
 */
function countMonthFirsts(nowSec: number, endSec: number): number {
  const now = new Date(nowSec * 1000)
  let count = 0

  // Start from the 1st of the next month after now
  let d = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  while (d.getTime() / 1000 <= endSec) {
    count++
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }
  return count
}

/* ------------------------------------------------------------------ */
/*  Main calculation                                                  */
/* ------------------------------------------------------------------ */

/**
 * Calculate the total carat gain from Date.now() until the banner's
 * en_end_date, combining recurring income, one-time event rewards,
 * and PvP event rewards.
 */
export function calculateCaratGainToBanner(
  bannerEndDate: number,
  selections: IncomeSelections,
  events: JpEvent[],
  pvpSchedule: PvpEvent[],
  incomeData: any,
): CaratGainResult {
  const now = Date.now() / 1000

  if (bannerEndDate <= now) {
    return { carats: 0, paidCarats: 0, tickets: 0, daysInWindow: 0, breakdown: [], eventDetails: [] }
  }

  const daysInWindow = (bannerEndDate - now) / 86400
  const accel = getAcceleration()

  let totalCarats = 0
  let paidCarats = 0
  let totalTickets = 0
  const breakdown: BreakdownItem[] = []

  /* ────────── 1. RECURRING INCOME (pro-rated) ────────── */

  // Daily missions
  const dailyCarats = incomeData.free_income.daily_missions * daysInWindow
  breakdown.push({ label: 'Daily Missions', carats: Math.round(dailyCarats), tickets: 0 })
  totalCarats += dailyCarats

  // Login bonus (weekly total / 7 × days)
  const loginWeekly = Object.values(
    incomeData.free_income.login_bonus_weekly as Record<string, number>,
  ).reduce((s: number, v: number) => s + v, 0)
  const loginCarats = (loginWeekly / 7) * daysInWindow
  breakdown.push({ label: 'Login Bonus', carats: Math.round(loginCarats), tickets: 0 })
  totalCarats += loginCarats

  // Team Trial (weekly → daily rate × days)
  const ttValue =
    (incomeData.free_income.team_trial_weekly as Record<string, number>)[
      selections.team_trial_weekly
    ] ?? 0
  const ttCarats = (ttValue / 7) * daysInWindow
  breakdown.push({
    label: `Team Trial (${selections.team_trial_weekly})`,
    carats: Math.round(ttCarats),
    tickets: 0,
  })
  totalCarats += ttCarats

  // Club Rank — pays out on the 1st of each month
  const crEntry = (
    incomeData.free_income.club_rank_monthly as Record<
      string,
      { carats: number; info: string }
    >
  )[selections.club_rank_monthly]
  if (crEntry) {
    const payouts = countMonthFirsts(now, bannerEndDate)
    const crCarats = crEntry.carats * payouts
    breakdown.push({
      label: `Club Rank (${selections.club_rank_monthly}) ×${payouts}`,
      carats: crCarats,
      tickets: 0,
    })
    totalCarats += crCarats
  }

  // Paid: Daily Carats Pack — 500 upfront every 30 days + 50/day
  if (selections.daily_carats_pack) {
    const pack = incomeData.paid_income.packs['Daily Carats Pack']
    const packCount = Math.ceil(daysInWindow / 30)
    const packPaid = packCount * pack.paid_upfront
    const packFree = pack.free_daily * daysInWindow
    const packTotal = packPaid + packFree
    
    breakdown.push({
      label: `Daily Carats Pack (×${packCount} packs)`,
      carats: Math.round(packTotal),
      tickets: 0,
    })
    totalCarats += packTotal
    paidCarats += packPaid
  }

  /* ────────── 2. EVENTS (JP→EN projected) ────────── */
  // Only count events whose projected EN start is >= now (not already started)
  let eventCarats = 0
  const eventDetails: { name: string; carats: number }[] = []

  for (const evt of events) {
    const enStart = jpToEn(evt.jpstart, accel)
    if (enStart >= now && enStart < bannerEndDate) {
      eventCarats += evt.carat_rewards
      eventDetails.push({ name: evt.name, carats: evt.carat_rewards })
    }
  }

  breakdown.push({
    label: `Events (${eventDetails.length} events)`,
    carats: eventCarats,
    tickets: 0,
  })
  totalCarats += eventCarats

  /* ────────── 3. PVP EVENTS (CM & LoH) ────────── */
  // These already have EN dates. Count events whose window overlaps [now, bannerEnd].
  let cmCarats = 0
  let cmTickets = 0
  let cmCount = 0
  let lohCarats = 0
  let lohTickets = 0
  let lohCount = 0

  for (const pvp of pvpSchedule) {
    const enStart = pvp.en_start ?? jpToEn(pvp.jp_start, accel)
    const enEnd = pvp.en_end ?? jpToEn(pvp.jp_end, accel)

    if (enEnd > now && enStart < bannerEndDate) {
      if (pvp.type === 'cm') {
        cmCount++
        const entry = (
          incomeData.free_income.champions_meeting as Record<
            string,
            { carats: number; tickets: number }
          >
        )[selections.champions_meeting]
        if (entry) {
          cmCarats += entry.carats
          cmTickets += entry.tickets
        }
      } else if (pvp.type === 'loh') {
        lohCount++
        const entry = (
          incomeData.free_income.league_of_heroes as Record<
            string,
            { carats: number; tickets: number }
          >
        )[selections.league_of_heroes]
        if (entry) {
          lohCarats += entry.carats
          lohTickets += entry.tickets
        }
      }
    }
  }

  if (cmCount > 0) {
    breakdown.push({
      label: `Champions Meeting ×${cmCount} (${selections.champions_meeting})`,
      carats: cmCarats,
      tickets: cmTickets,
    })
    totalCarats += cmCarats
    totalTickets += cmTickets
  }

  if (lohCount > 0) {
    breakdown.push({
      label: `League of Heroes ×${lohCount} (${selections.league_of_heroes})`,
      carats: lohCarats,
      tickets: lohTickets,
    })
    totalCarats += lohCarats
    totalTickets += lohTickets
  }

  return {
    carats: Math.round(totalCarats),
    paidCarats: Math.round(paidCarats),
    tickets: totalTickets,
    daysInWindow: Math.round(daysInWindow * 10) / 10,
    breakdown,
    eventDetails,
  }
}
