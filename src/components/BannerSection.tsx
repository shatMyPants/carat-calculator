import { useState, useRef, useMemo } from 'react'
import type { Banner, IncomeSelections, JpEvent, PvpEvent } from '../types'
import { calculateCaratGainToBanner } from '../utils/calculateCaratGain'



/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 10 // Reduced since cards are bigger

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(sec: number) {
  const d = new Date(sec * 1000)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/*  Sub-Component: BannerCard                                          */
/* ------------------------------------------------------------------ */

interface CardProps {
  banner: Banner
  isSelected: boolean
  onToggle: (id: number) => void
  selections: IncomeSelections
  events: JpEvent[]
  pvpSchedule: PvpEvent[]
  incomeData: any
}

function BannerCard({ banner, isSelected, onToggle, selections, events, pvpSchedule, incomeData }: CardProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragMoved, setDragMoved] = useState(false)

  const gain = useMemo(() => {
    return calculateCaratGainToBanner(banner.en_end_date, selections, events, pvpSchedule, incomeData)
  }, [banner.en_end_date, selections, events, pvpSchedule, incomeData])

  const freeCarats = gain.carats - gain.paidCarats
  const totalPulls = Math.floor(gain.carats / 150) + gain.tickets
  const miscPulls = gain.tickets

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || banner.targets.length <= 2) return
    setIsDragging(true)
    setDragMoved(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    if (Math.abs(walk) > 5) setDragMoved(true)
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      onClick={(e) => {
        // Prevent selection if we just finished a drag
        if (dragMoved) {
          e.stopPropagation()
          return
        }
        onToggle(banner.id)
      }}
      className={`relative flex flex-col rounded-xl overflow-hidden transition-all border cursor-pointer
        ${isSelected
          ? 'bg-[var(--vp-c-bg-elv)] border-[#FF3939] ring-1 ring-[#FF3939]/30'
          : 'bg-[var(--vp-c-bg-alt)] border-[var(--vp-c-border)] hover:border-neutral-700'
        }`}
    >

      {/* Header: Dates & Action */}
      <div className="flex justify-between items-center px-6 py-2 sm:py-3 border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]/30">
        <div className="flex items-baseline gap-2 sm:gap-5">
          <span className="text-xs sm:text-sm md:text-md font-extrabold text-[var(--vp-c-text-1)] tracking-tight">
            {formatDate(banner.en_start_date)} - {formatDate(banner.en_end_date)}
          </span>
          <span className="text-[0.5rem] sm:text-xs md:text-sm text-neutral-500 font-semibold tracking-wide">
            JP Date: {formatDate(banner.start_date)} - {formatDate(banner.end_date)}
          </span>
        </div>

        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200
          ${isSelected ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-900/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
          {isSelected ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 aspect-square">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <span className="text-xl sm:text-2xl font-light mb-0.5">+</span>
          )}
        </div>
      </div>

      {/* Content: Targets & Stats */}
      <div className="flex px-6 py-6 items-center justify-start gap-10">
        {/* Targets Entity (Left) */}
        <div className="flex-1 min-w-0 relative group/carousel">
          {banner.targets.length > 2 && (
            <>
              {/* Fade Indicator */}
              <div className={`absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none transition-[border-color,box-shadow] duration-300 bg-gradient-to-l to-transparent
                ${isSelected ? 'from-[var(--vp-c-bg-elv)]' : 'from-[var(--vp-c-bg-alt)]'}`}
              />

              {/* Scroll Hint */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none group-hover/carousel:opacity-0 transition-opacity duration-300">
                <div className="bg-neutral-800/80 backdrop-blur-sm p-2 rounded-full border border-neutral-700 shadow-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </>
          )}

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex gap-4 sm:gap-8 pb-1 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none justify-center md:justify-start"
          >
            {banner.targets.map((t, i) => (
              <div key={i} className="group/target flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 shrink-0 min-w-[125px] sm:min-w-[200px] max-w-[20vw] sm:max-w-[200px] w-full sm:w-auto transition-all duration-500 ease-in-out py-2 text-center sm:text-left">
                <div className="w-24 aspect-square rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  <img
                    src={banner.bannerType === 0 ? "/carat-calculator/images/character.png" : "/carat-calculator/images/support.png"}
                    alt={t.charaName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-bold text-[var(--vp-c-text-1)] leading-tight mb-1 break-words">{t.charaName}</div>
                  <div className="text-xs text-[var(--vp-c-text-2)] font-medium tracking-tight break-words hidden sm:inline-block">{t.cardTitle || t.supportCardTitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-16 w-px bg-neutral-800/60 shrink-0 hidden md:inline-block" />

        {/* Stats Entity (Right) */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 shrink-0 w-[230px] hidden lg:grid">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-wider mb-1 whitespace-nowrap">Carat Estimate</span>
            <span className="text-2xl font-bold text-[#4ADE80] tracking-tighter">{freeCarats.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-wider mb-1 whitespace-nowrap">Paid Carat Estimate</span>
            <span className="text-2xl font-bold text-[#FBBF24] tracking-tighter">{gain.paidCarats.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-wider mb-1 whitespace-nowrap">Misc Pulls</span>
            <span className="text-2xl font-bold text-neutral-100">{miscPulls}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-wider mb-1 whitespace-nowrap">Total Pulls</span>
            <span className="text-2xl font-bold text-white">{totalPulls}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component: BannerSection                                          */
/* ------------------------------------------------------------------ */

interface Props {
  banners: Banner[]
  selectedBannerIds: number[]
  onToggle: (id: number) => void
  selections: IncomeSelections
  events: JpEvent[]
  pvpSchedule: PvpEvent[]
  incomeData: any
  isMinimized?: boolean
  onFocus?: () => void
}

export function BannerSection({
  banners,
  selectedBannerIds,
  onToggle,
  selections,
  events,
  pvpSchedule,
  incomeData,
  isMinimized,
  onFocus
}: Props) {
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

  if (isMinimized) {
    return (
      <div
        onClick={onFocus}
        className="h-full min-h-[500px] rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center py-8 cursor-pointer hover:bg-neutral-800/50 transition-colors"
      >
        <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-6">Select Banners</span>
      </div>
    )
  }

  return (
    <section id="banner-selector" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Select Target Banner</h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          id="banner-search"
          type="text"
          placeholder="Search by character or card name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 px-3 py-2 text-sm
                     placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500
                     transition-colors"
        />
        <div className="flex bg-neutral-800 p-1 rounded-xl border border-neutral-700/50">
          {(['all', 'char', 'support'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeFilterChange(t)}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer uppercase tracking-wider
                ${typeFilter === t
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/50'
                }`}
            >
              {t === 'all' ? 'All' : t === 'char' ? 'Character' : 'Support'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500 mb-4">{filtered.length} banners found</p>

      {/* Banner list container */}
      <div
        onScroll={(e) => {
          const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
          if (scrollHeight - scrollTop <= clientHeight + 500 && hasMore) {
            setVisibleCount(c => c + PAGE_SIZE);
          }
        }}
        className="space-y-4 max-h-[720px] overflow-y-auto no-scrollbar pr-2 scroll-smooth"
      >
        {filtered.slice(0, visibleCount).map((b) => (
          <div key={b.id} className="py-1">
            <BannerCard
              banner={b}
              isSelected={selectedBannerIds.includes(b.id)}
              onToggle={onToggle}
              selections={selections}
              events={events}
              pvpSchedule={pvpSchedule}
              incomeData={incomeData}
            />
          </div>
        ))}

        {/* Loading / End indicator */}
        <div className="py-8 text-center text-neutral-600 text-xs font-medium uppercase tracking-widest">
          {hasMore ? 'Loading more banners...' : 'End of list'}
        </div>
      </div>
    </section>
  )
}
