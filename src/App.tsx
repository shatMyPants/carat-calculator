import { useState, useMemo } from 'react'
import timelineBanners from '../timeline_banners.json'
import jpPvp from '../jp_pvp.json'
import jpEvents from '../jp_events.json'
import incomeData from '../income.json'
import type { IncomeSelections, PvpEvent, JpEvent, RawBanner, SelectedBanner } from './types'
import { projectBannerEnDates } from './utils/dateProjection'
import { calculateMonthlyIncome } from './utils/calculateMonthlyIncome'
import { calculateCaratGainToBanner } from './utils/calculateCaratGain'
import { IncomeSection } from './components/IncomeSection'
import { BannerSection } from './components/BannerSection'
import { SelectedBanners } from './components/SelectedBanners'
import { SummaryCard } from './components/SummaryCard'
import { TimelinePage } from './components/TimelinePage'

/* ------------------------------------------------------------------ */
/*  Page type                                                         */
/* ------------------------------------------------------------------ */

type Page = 'calculator' | 'timeline'

/* ------------------------------------------------------------------ */
/*  Defaults                                                          */
/* ------------------------------------------------------------------ */

const defaultSelections: IncomeSelections = {
  team_trial_weekly: 'Class 6',
  club_rank_monthly: 'A',
  champions_meeting: 'Open League',
  league_of_heroes: 'Gold 1',
  daily_carats_pack: false,
}

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */

export default function App() {
  const [page, setPage] = useState<Page>('calculator')
  const [selections, setSelections] = useState<IncomeSelections>(defaultSelections)
  const [selectedBanners, setSelectedBanners] = useState<SelectedBanner[]>([])
  const [focusSide, setFocusSide] = useState<'list' | 'detail'>('list')

  const result = useMemo(
    () => calculateMonthlyIncome(selections, jpPvp as PvpEvent[]),
    [selections],
  )

  const bannersWithEnDates = useMemo(
    () => projectBannerEnDates(timelineBanners as unknown as RawBanner[]),
    [],
  )

  const selectedBannersWithData = useMemo(() => {
    // Sort selected banners by end date to calculate cumulative costs correctly
    const sorted = [...selectedBanners].sort((a, b) => {
      const bA = bannersWithEnDates.find(x => x.id === a.bannerId)
      const bB = bannersWithEnDates.find(x => x.id === b.bannerId)
      return (bA?.en_end_date || 0) - (bB?.en_end_date || 0)
    })

    let cumulativeCost = 0
    return sorted.map((s) => {
      const banner = bannersWithEnDates.find((b) => b.id === s.bannerId)
      if (!banner) return null

      const caratGain = calculateCaratGainToBanner(
        banner.en_end_date,
        selections,
        jpEvents as JpEvent[],
        jpPvp as PvpEvent[],
        incomeData,
      )

      cumulativeCost += s.pulls * 150
      const netCarats = caratGain.carats - cumulativeCost

      return {
        ...banner,
        pulls: s.pulls,
        caratGain,
        netCarats
      }
    }).filter(Boolean) as any[]
  }, [selectedBanners, bannersWithEnDates, selections])

  const handleToggleBanner = (id: number) => {
    setSelectedBanners(prev => {
      const exists = prev.find(b => b.bannerId === id)
      if (exists) {
        return prev.filter(b => b.bannerId !== id)
      } else {
        return [...prev, { bannerId: id, pulls: 0 }]
      }
    })
  }

  const handleUpdatePulls = (id: number, pulls: number) => {
    setSelectedBanners(prev => prev.map(b => b.bannerId === id ? { ...b, pulls } : b))
  }

  const handleRemoveBanner = (id: number) => {
    setSelectedBanners(prev => prev.filter(b => b.bannerId !== id))
  }

  const toggleFocus = () => {
    setFocusSide(prev => prev === 'list' ? 'detail' : 'list')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-6">
          <h1 className="text-lg font-semibold tracking-tight">Carat Calculator</h1>
          <nav className="flex gap-1 ml-auto">
            <button
              onClick={() => setPage('calculator')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === 'calculator'
                ? 'bg-neutral-700/60 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
                }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setPage('timeline')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === 'timeline'
                ? 'bg-neutral-700/60 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
                }`}
            >
              Timeline
            </button>
          </nav>
        </div>
      </header>

      {page === 'timeline' ? (
        <TimelinePage />
      ) : (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <SummaryCard result={result} />
          <IncomeSection selections={selections} onChange={setSelections} />
          
          <div className="flex flex-col md:flex-row gap-4 items-start relative">
            {/* Banner List Section */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden md:sticky md:top-24 h-fit
              ${focusSide === 'list' ? 'flex-[1] min-w-0' : 'w-16 shrink-0'}`}
            >
              <BannerSection
                banners={bannersWithEnDates}
                selectedBannerIds={selectedBanners.map(b => b.bannerId)}
                onToggle={handleToggleBanner}
                selections={selections}
                events={jpEvents as JpEvent[]}
                pvpSchedule={jpPvp as PvpEvent[]}
                incomeData={incomeData}
                isMinimized={focusSide === 'detail'}
                onFocus={() => setFocusSide('list')}
              />
            </div>

            {/* Swap Focus Button (Middle) */}
            <div className="hidden md:flex items-center justify-center pt-32 shrink-0 z-20">
              <button
                onClick={toggleFocus}
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all shadow-xl flex items-center justify-center cursor-pointer group"
                title="Swap Focus"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`w-5 h-5 transition-transform duration-500 ${focusSide === 'detail' ? 'rotate-180' : ''}`}
                >
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            </div>

            {/* Selected Banners Section */}
            <aside className={`transition-all duration-500 ease-in-out md:sticky md:top-24 h-fit
              ${focusSide === 'detail' ? 'flex-[1] min-w-0' : 'w-16 shrink-0'}`}
            >
              {selectedBannersWithData.length > 0 ? (
                <SelectedBanners 
                  selectedBanners={selectedBannersWithData}
                  onUpdatePulls={handleUpdatePulls}
                  onRemove={handleRemoveBanner}
                  isMinimized={focusSide === 'list'}
                  onFocus={() => setFocusSide('detail')}
                />
              ) : (
                <div 
                  onClick={() => setFocusSide('detail')}
                  className={`rounded-2xl bg-neutral-900 border border-neutral-800 border-dashed transition-all duration-500 flex flex-col items-center justify-center min-h-[300px]
                    ${focusSide === 'list' ? 'p-2 cursor-pointer hover:bg-neutral-800/50' : 'p-12 text-center'}`}
                >
                  {focusSide === 'list' ? (
                    <div className="flex flex-col items-center gap-4">
                      <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Selected</span>
                      <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4 text-neutral-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                      </div>
                      <h3 className="text-neutral-400 font-medium mb-1">No Banners Selected</h3>
                      <p className="text-neutral-500 text-sm max-w-[200px]">
                        Select banners from the list to see cumulative gain projections and plan your pulls.
                      </p>
                    </>
                  )}
                </div>
              )}
            </aside>
          </div>
        </main>
      )}
    </div>
  )
}
