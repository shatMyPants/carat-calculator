import { useState, useMemo } from 'react'
import timelineBanners from '../timeline_banners.json'
import jpPvp from '../jp_pvp.json'
import jpEvents from '../jp_events.json'
import incomeData from '../income.json'
import type { IncomeSelections, PvpEvent, JpEvent, RawBanner } from './types'
import { projectBannerEnDates } from './utils/dateProjection'
import { calculateMonthlyIncome } from './utils/calculateMonthlyIncome'
import { calculateCaratGainToBanner } from './utils/calculateCaratGain'
import { IncomeSection } from './components/IncomeSection'
import { BannerSection } from './components/BannerSection'
import { BannerDetail } from './components/BannerDetail'
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
  const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null)

  const result = useMemo(
    () => calculateMonthlyIncome(selections, jpPvp as PvpEvent[]),
    [selections],
  )

  const bannersWithEnDates = useMemo(
    () => projectBannerEnDates(timelineBanners as unknown as RawBanner[]),
    [],
  )

  const selectedBanner = useMemo(
    () => bannersWithEnDates.find((b) => b.id === selectedBannerId) ?? null,
    [selectedBannerId, bannersWithEnDates],
  )

  const caratGain = useMemo(() => {
    if (!selectedBanner) return null
    return calculateCaratGainToBanner(
      selectedBanner.en_end_date,
      selections,
      jpEvents as JpEvent[],
      jpPvp as PvpEvent[],
      incomeData,
    )
  }, [selectedBanner, selections])

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
          <BannerSection
            banners={bannersWithEnDates}
            selectedBannerId={selectedBannerId}
            onSelect={setSelectedBannerId}
            selections={selections}
            events={jpEvents as JpEvent[]}
            pvpSchedule={jpPvp as PvpEvent[]}
            incomeData={incomeData}
          />
          {selectedBanner && (
            <BannerDetail banner={selectedBanner} caratGain={caratGain} />
          )}
        </main>
      )}
    </div>
  )
}
