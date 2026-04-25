import timelineBanners from '../../timeline_banners.json'
import jpEvents from '../../jp_events.json'
import jpPvp from '../../jp_pvp.json'
import type { RawBanner, RawEvent, RawPvp, TimelineEntry } from '../types'
import { EN_LAUNCH, JP_LAUNCH } from '../types'
import { getAcceleration } from './dateProjection'

/**
 * Build a unified, chronologically sorted timeline of banners, events, and PvP.
 * All dates are projected to EN using the cached acceleration factor.
 */
export function buildTimeline(): TimelineEntry[] {
  const entries: TimelineEntry[] = []
  const accel = getAcceleration()

  for (const b of timelineBanners as unknown as RawBanner[]) {
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

    entries.push({
      kind: 'banner',
      jpStart: b.jpStartDate,
      jpEnd: b.jpEndDate,
      enStart,
      enEnd,
      isPredicted,
      data: b,
    })
  }

  for (const e of jpEvents as RawEvent[]) {
    const enStart = Math.round(EN_LAUNCH + (e.jpstart - JP_LAUNCH) * accel)
    const enEnd = Math.round(EN_LAUNCH + (e.jpend - JP_LAUNCH) * accel)

    entries.push({
      kind: 'event',
      jpStart: e.jpstart,
      jpEnd: e.jpend,
      enStart,
      enEnd,
      isPredicted: true,
      data: e,
    })
  }

  for (const p of jpPvp as RawPvp[]) {
    const enStart = p.en_start ?? Math.round(EN_LAUNCH + (p.jp_start - JP_LAUNCH) * accel)
    const enEnd = p.en_end ?? Math.round(EN_LAUNCH + (p.jp_end - JP_LAUNCH) * accel)

    entries.push({
      kind: 'pvp',
      jpStart: p.jp_start,
      jpEnd: p.jp_end,
      enStart,
      enEnd,
      isPredicted: true,
      data: p,
    })
  }

  entries.sort((a, b) => a.enStart - b.enStart || a.kind.localeCompare(b.kind))
  return entries
}

/** Group consecutive entries that share the same EN start day */
export function groupByDate(entries: TimelineEntry[]): { enStart: number; items: TimelineEntry[] }[] {
  const groups: { enStart: number; items: TimelineEntry[] }[] = []
  for (const entry of entries) {
    const last = groups[groups.length - 1]
    const day = Math.floor(entry.enStart / 86400) * 86400
    if (last && Math.floor(last.enStart / 86400) * 86400 === day) {
      last.items.push(entry)
    } else {
      groups.push({ enStart: entry.enStart, items: [entry] })
    }
  }
  return groups
}
