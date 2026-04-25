import { useState, useMemo } from 'react'
import type { Banner } from '../types'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 20

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  banners: Banner[]
  selectedBannerId: number | null
  onSelect: (id: number | null) => void
}

export function BannerSection({ banners, selectedBannerId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'char' | 'support'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Sort banners in ascending
  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => a.en_start_date - b.en_start_date),
    [banners],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sortedBanners.filter((b) => {
      // Type filter
      if (typeFilter === 'char' && b.bannerType !== 0) return false
      if (typeFilter === 'support' && b.bannerType !== 1) return false

      // Search across character names and card titles
      if (!q) return true
      return b.targets.some(
        (t) =>
          t.charaName.toLowerCase().includes(q) ||
          (t.cardTitle?.toLowerCase().includes(q) ?? false) ||
          (t.supportCardTitle?.toLowerCase().includes(q) ?? false),
      )
    })
  }, [sortedBanners, search, typeFilter])

  // Reset pagination when filters change
  const visibleBanners = useMemo(() => {
    return filtered.slice(0, visibleCount)
  }, [filtered, visibleCount])

  const hasMore = visibleCount < filtered.length

  // Reset visible count when search/filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setVisibleCount(PAGE_SIZE)
  }

  const handleTypeFilterChange = (t: 'all' | 'char' | 'support') => {
    setTypeFilter(t)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <section id="banner-selector" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Banner List</h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="banner-search"
          type="text"
          placeholder="Search by character name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 px-3 py-2 text-sm
                     placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500
                     transition-colors"
        />
        <div className="flex gap-1">
          {(['all', 'char', 'support'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeFilterChange(t)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer
                ${typeFilter === t
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
            >
              {t === 'all' ? 'All' : t === 'char' ? 'Character' : 'Support'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500 mb-3">{filtered.length} banners</p>

      {/* Banner list */}
      <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
        {visibleBanners.map((b) => {
          const isSelected = b.id === selectedBannerId
          const label = b.targets.map((t) => t.charaName).join(', ')
          const dateStr = new Date(b.en_start_date * 1000).toLocaleDateString()

          return (
            <button
              key={b.id}
              onClick={() => onSelect(isSelected ? null : b.id)}
              className={`w-full text-left rounded-lg px-4 py-3 transition-all cursor-pointer
                border ${isSelected
                  ? 'bg-red-950/40 border-red-700'
                  : 'bg-neutral-800/60 border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800'
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded
                    ${b.bannerType === 0 ? 'bg-red-900/60 text-red-300' : 'bg-blue-900/60 text-blue-300'}`}>
                    {b.bannerType === 0 ? 'CHAR' : 'SUPP'}
                  </span>
                  <span className="ml-2 text-sm font-medium truncate">{label}</span>
                </div>
                <span className="text-xs text-neutral-500 shrink-0">{dateStr}</span>
              </div>
            </button>
          )
        })}

        {/* Load more */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200
                       bg-neutral-800/40 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer
                       border border-dashed border-neutral-700"
          >
            Show more ({filtered.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </section>
  )
}
