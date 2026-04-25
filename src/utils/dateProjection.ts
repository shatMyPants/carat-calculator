import { calculateAcceleration } from '../../calculate_acceleration'
import { EN_LAUNCH, JP_LAUNCH } from '../types'
import type { Banner, RawBanner } from '../types'

/* ------------------------------------------------------------------ */
/*  Cached acceleration factor                                        */
/* ------------------------------------------------------------------ */

let _cachedAccel: number | null = null

/** Returns the acceleration factor, cached after first call. */
export function getAcceleration(): number {
  if (_cachedAccel !== null) return _cachedAccel
  _cachedAccel = calculateAcceleration()
  return _cachedAccel
}

/* ------------------------------------------------------------------ */
/*  Date formatting                                                   */
/* ------------------------------------------------------------------ */

export function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function fmtDateRange(start: number, end: number): string {
  return `${fmtDate(start)} — ${fmtDate(end)}`
}

/* ------------------------------------------------------------------ */
/*  Banner EN-date projection                                         */
/* ------------------------------------------------------------------ */

/** Project a JP unix timestamp to the estimated EN timestamp. */
export function jpToEn(jpTimestamp: number, accel: number): number {
  return Math.round(EN_LAUNCH + (jpTimestamp - JP_LAUNCH) * accel)
}

/**
 * Take raw timeline banners and compute EN dates (actual or predicted).
 * Filters out banners whose EN end date is in the past.
 */
export function projectBannerEnDates(rawBanners: RawBanner[]): Banner[] {
  const accel = getAcceleration()
  const nowTs = Date.now() / 1000

  return rawBanners.map(b => {
    let enStart = 0
    let enEnd = 0
    let isPredicted = false

    if (typeof b.enStartDate === 'number') {
      enStart = b.enStartDate
      enEnd = b.enEndDate as number
    } else {
      enStart = Math.round(EN_LAUNCH + b.timeFromJPLaunch * accel)
      enEnd = Math.round(EN_LAUNCH + (b.jpEndDate - JP_LAUNCH) * accel)
      isPredicted = true
    }

    return {
      ...b,
      start_date: b.jpStartDate,
      end_date: b.jpEndDate,
      en_start_date: enStart,
      en_end_date: enEnd,
      is_predicted: isPredicted,
    } as Banner
  }).filter(b => b.en_end_date > nowTs)
}
