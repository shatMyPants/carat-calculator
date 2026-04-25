import { memo, useMemo, useState } from 'react'
import type { TimelineEntry, RawBanner, RawEvent, RawPvp } from '../types'
import { fmtDate, fmtDateRange } from '../utils/dateProjection'
import { buildTimeline, groupByDate } from '../utils/buildTimeline'

/* ------------------------------------------------------------------ */
/*  Sub-components (memoized)                                         */
/* ------------------------------------------------------------------ */

function DatesDisplay({ jpStart, jpEnd }: { jpStart: number, jpEnd: number }) {
  return (
    <div className="mt-3 pt-3 border-t border-neutral-800/50">
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-neutral-600" />
          <span>JP Dates:</span>
        </div>
        <span className="font-mono">{fmtDateRange(jpStart, jpEnd)}</span>
      </div>
    </div>
  )
}

const BannerCard = memo(function BannerCard({ entry }: { entry: TimelineEntry & { kind: 'banner' } }) {
  const banner = entry.data as RawBanner
  const [expanded, setExpanded] = useState(false)
  const typeLabel = banner.bannerType === 0 ? 'Character' : 'Support'
  const accentColor = banner.bannerType === 0 ? 'text-rose-400' : 'text-violet-400'
  const borderColor = banner.bannerType === 0 ? 'border-rose-500/30' : 'border-violet-500/30'
  const bgGlow = banner.bannerType === 0
    ? 'bg-gradient-to-br from-rose-500/5 to-transparent'
    : 'bg-gradient-to-br from-violet-500/5 to-transparent'

  const visibleTargets = expanded ? banner.targets : banner.targets.slice(0, 5)
  const hasMore = banner.targets.length > 5

  return (
    <div className={`rounded-xl border ${borderColor} ${bgGlow} overflow-hidden bg-neutral-900/40 backdrop-blur-sm`}>
      <div className="w-full h-36 bg-neutral-800/60 flex items-center justify-center border-b border-neutral-700/40 relative">
        <span className="text-neutral-600 text-sm tracking-wide">Banner Image</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-mono text-blue-400/80 leading-none">
            {fmtDateRange(entry.enStart, entry.enEnd)} {entry.isPredicted && '(Predicted)'}
          </p>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-widest ${accentColor}`}>
              {typeLabel} Banner
            </span>
            <span className="text-xs text-neutral-500 font-mono">#{banner.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visibleTargets.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-sm overflow-hidden bg-neutral-900/50 p-2 rounded-lg">
              <span className={`${accentColor} shrink-0 mt-0.5 text-xs`}>★</span>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-neutral-200 truncate text-[13px]">{t.charaName}</span>
                <span className="text-neutral-500 text-[10px] uppercase truncate tracking-wide mt-0.5">{t.cardTitle ?? t.supportCardTitle}</span>
              </div>
            </div>
          ))}
          {!expanded && hasMore && (
            <button 
              onClick={() => setExpanded(true)}
              className="flex items-center justify-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all py-2 rounded-lg border border-dashed border-neutral-700"
            >
              +{banner.targets.length - 5} more
            </button>
          )}
        </div>

        <DatesDisplay jpStart={entry.jpStart} jpEnd={entry.jpEnd} />
      </div>
    </div>
  )
})

const EventCard = memo(function EventCard({ entry }: { entry: TimelineEntry & { kind: 'event' } }) {
  const event = entry.data as RawEvent
  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4 bg-neutral-900/40 backdrop-blur-sm">
      <div className="space-y-1 mb-3">
        <p className="text-[11px] font-mono text-blue-400/80 leading-none">
          {fmtDateRange(entry.enStart, entry.enEnd)} {entry.isPredicted && '(Predicted)'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Event</span>
          <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">{event.carat_rewards.toLocaleString()} 💎</span>
        </div>
      </div>
      <p className="text-[15px] text-neutral-200 font-medium leading-snug">{event.name}</p>
      <DatesDisplay jpStart={entry.jpStart} jpEnd={entry.jpEnd} />
    </div>
  )
})

const PvpCard = memo(function PvpCard({ entry }: { entry: TimelineEntry & { kind: 'pvp' } }) {
  const pvp = entry.data as RawPvp
  const isCm = pvp.type === 'cm'
  const label = isCm ? 'Champions Meeting' : 'League of Heroes'
  const accent = isCm ? 'text-sky-400' : 'text-emerald-400'
  const border = isCm ? 'border-sky-500/20' : 'border-emerald-500/20'
  const bg = isCm
    ? 'bg-gradient-to-br from-sky-500/5 to-transparent'
    : 'bg-gradient-to-br from-emerald-500/5 to-transparent'

  return (
    <div className={`rounded-xl border ${border} ${bg} p-4 bg-neutral-900/40 backdrop-blur-sm`}>
      <div className="space-y-1 mb-1">
        <p className="text-[11px] font-mono text-blue-400/80 leading-none">
          {fmtDateRange(entry.enStart, entry.enEnd)} {entry.isPredicted && '(Predicted)'}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{label}</span>
          <span className="text-xs text-neutral-500 font-mono bg-neutral-800/50 px-2 py-0.5 rounded-full">#{pvp.id}</span>
        </div>
      </div>
      <DatesDisplay jpStart={entry.jpStart} jpEnd={entry.jpEnd} />
    </div>
  )
})

/* ------------------------------------------------------------------ */
/*  Filters                                                           */
/* ------------------------------------------------------------------ */

type FilterKind = 'all' | 'banner' | 'event' | 'pvp'

const FILTER_OPTIONS: { value: FilterKind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'banner', label: 'Banners' },
  { value: 'event', label: 'Events' },
  { value: 'pvp', label: 'PvP' },
]

/* ------------------------------------------------------------------ */
/*  Timeline Page                                                     */
/* ------------------------------------------------------------------ */

export function TimelinePage() {
  const [filter, setFilter] = useState<FilterKind>('all')

  const allEntries = useMemo(() => buildTimeline(), [])

  const filtered = useMemo(() => {
    if (filter === 'all') return allEntries
    return allEntries.filter((e) => e.kind === filter)
  }, [allEntries, filter])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Timeline</h2>
        <p className="text-sm text-neutral-500">
          Chronological view of events, banners, and PvP. Ordered by predicted EN dates.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-8 sticky top-[57px] z-10 bg-neutral-950/90 backdrop-blur-sm py-3 -mx-4 px-4 shadow-sm border-b border-neutral-800">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-200
              ${filter === opt.value
                ? 'bg-neutral-100 text-neutral-900 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
              }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] uppercase tracking-wider font-semibold text-neutral-600 self-center">
          {filtered.length} entries
        </span>
      </div>

      {/* Timeline */}
      <div className="relative pb-16">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 via-neutral-800 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.3)]" />

        {groups.map((group, gi) => (
          <div key={gi} className="relative pl-12 pb-12 group">
            {/* Dot on the line */}
            <div className="absolute left-[11px] top-1.5 w-3 h-3 rounded-full bg-blue-400 ring-4 ring-neutral-950 shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-transform duration-300 group-hover:scale-110" />

            {/* Date heading */}
            <time className="block text-[13px] font-bold text-blue-400 uppercase tracking-widest mb-4 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              {fmtDate(group.enStart)}
            </time>

            {/* Cards */}
            <div className="space-y-4">
              {group.items.map((entry, ei) => (
                <div key={ei} className="transition-transform duration-300 hover:-translate-y-1">
                  {entry.kind === 'banner' && <BannerCard entry={entry} />}
                  {entry.kind === 'event' && <EventCard entry={entry} />}
                  {entry.kind === 'pvp' && <PvpCard entry={entry} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
