import { useState } from 'react'
import type { Banner, CaratGainResult } from '../types'

interface BannerWithPulls extends Banner {
  pulls: number
  caratGain: CaratGainResult | null
  netCarats: number
}

interface Props {
  selectedBanners: BannerWithPulls[]
  onUpdatePulls: (id: number, pulls: number) => void
  onRemove: (id: number) => void
  isMinimized?: boolean
  onFocus?: () => void
}

export function SelectedBanners({ selectedBanners, onUpdatePulls, onRemove, isMinimized, onFocus }: Props) {
  const [showEventDetails, setShowEventDetails] = useState<Record<number, boolean>>({})

  const toggleEventDetails = (id: number) => {
    setShowEventDetails(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (isMinimized) {
    return (
      <div
        onClick={onFocus}
        className="h-full min-h-[500px] rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center py-8 cursor-pointer hover:bg-neutral-800/50 transition-colors"
      >
        <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-6">Selected</span>
        <div className="flex flex-col gap-3 items-center">
          {selectedBanners.slice(0, 3).map((b) => (
            <div key={b.id} className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 overflow-hidden shadow-inner shrink-0">
              <img
                src={b.bannerType === 0 ? "/carat-calculator/images/character.png" : "/carat-calculator/images/support.png"}
                alt={b.targets[0]?.charaName}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {selectedBanners.length > 3 && (
            <span className="text-[10px] font-black text-neutral-600">+{selectedBanners.length - 3}</span>
          )}
          <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-bold text-neutral-400 tracking-tight mt-2">
            {selectedBanners.length} Banners
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedBanners.map((b) => (
        <section key={b.id} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 relative group">
          {/* Banner Type Label & Remove Button */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="relative flex items-center justify-end">
              {/* Label */}
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 bg-neutral-800/80 px-2.5 py-1 rounded-full border border-neutral-700/50 backdrop-blur-md shadow-sm transition-all duration-300 group-hover:mr-10">
                {b.bannerType === 0 ? 'Character' : 'Support'}
              </span>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(b.id)}
                className="absolute right-0 w-8 h-8 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center hover:bg-red-900/40 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer border border-neutral-700/50 shadow-xl"
                title="Remove Banner"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Top Section: Image & Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Banner Image */}
            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[21/9] sm:w-128 sm:h-47 bg-neutral-800/30 shrink-0">
              <img
                src="/carat-calculator/images/banner.png"
                alt="Banner"
                className="w-full h-full object-cover opacity-60"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>

            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h2 className="text-lg font-black text-neutral-100 leading-tight mb-2 line-clamp-3 pr-24">
                {b.targets.map(t => t.charaName).join(', ')}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black tracking-widest text-neutral-600 mb-0.5">EN Projection Window</span>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-bold">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-neutral-600">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{new Date(b.en_start_date * 1000).toLocaleDateString()} — {new Date(b.en_end_date * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Cards Grid (2 Columns, Max 2 Rows = 4 slots total) */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {b.targets.length > 4 ? (
              <>
                {b.targets.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/30 border border-neutral-700/20 hover:bg-neutral-800/50 transition-colors">
                    <div className="w-9 h-9 rounded bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 shadow-inner">
                      <img
                        src={b.bannerType === 0 ? "/carat-calculator/images/character.png" : "/carat-calculator/images/support.png"}
                        alt={t.charaName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="text-[10px] font-bold text-neutral-200 truncate leading-tight">{t.charaName}</div>
                      <div className="text-[8px] text-neutral-500 font-medium truncate leading-none mt-1">{t.cardTitle || t.supportCardTitle}</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center p-1.5 rounded-lg border border-dashed border-neutral-800 text-[10px] font-black text-neutral-600 uppercase tracking-widest bg-neutral-800/10">
                  +{b.targets.length - 3} More
                </div>
              </>
            ) : (
              b.targets.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/30 border border-neutral-700/20 hover:bg-neutral-800/50 transition-colors">
                  <div className="w-9 h-9 rounded bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 shadow-inner">
                    <img
                      src={b.bannerType === 0 ? "/carat-calculator/images/character.png" : "/carat-calculator/images/support.png"}
                      alt={t.charaName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="text-[10px] font-bold text-neutral-200 truncate leading-tight">{t.charaName}</div>
                    <div className="text-[8px] text-neutral-500 font-medium truncate leading-none mt-1">{t.cardTitle || t.supportCardTitle}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pull Input & Carat Calculation (Compact) */}
          <div className="border-t border-neutral-800 pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <label className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mb-1">Investment</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={b.pulls}
                      onChange={(e) => onUpdatePulls(b.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 bg-neutral-800/50 border border-neutral-700 rounded-md px-2 py-1 text-base font-bold text-neutral-100 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                    />
                  </div>
                  <div className="text-[10px] text-neutral-600 font-medium">× 150 = <span className="text-neutral-500">{(b.pulls * 150).toLocaleString()}</span></div>
                </div>
              </div>

              {b.caratGain && (
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mb-0.5">Available at end</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black tracking-tighter ${b.netCarats >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                      {b.netCarats.toLocaleString()}
                    </span>
                    <span className="text-neutral-600 text-[9px] font-black uppercase tracking-widest">Carats</span>
                  </div>
                </div>
              )}
            </div>

            {b.caratGain && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2 border-y border-neutral-800/50">
                  <div className="flex-1">
                    <span className="text-[9px] text-neutral-600 uppercase font-bold tracking-wider block mb-0.5">Gain</span>
                    <span className="text-sm font-bold text-neutral-400">+{b.caratGain.carats.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-6 bg-neutral-800" />
                  <div className="flex-1 text-right">
                    <span className="text-[9px] text-neutral-600 uppercase font-bold tracking-wider block mb-0.5">Tickets</span>
                    <span className="text-sm font-bold text-amber-500/80">{b.caratGain.tickets}🎫</span>
                  </div>
                </div>

                {/* Collapsible event details */}
                {b.caratGain.eventDetails.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleEventDetails(b.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-neutral-700 hover:text-neutral-500 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {showEventDetails[b.id] ? '▼' : '▶'} {b.caratGain.eventDetails.length} Events
                    </button>
                    {showEventDetails[b.id] && (
                      <div className="mt-2 max-h-24 overflow-y-auto space-y-1 pl-2 border-l border-neutral-800 no-scrollbar">
                        {b.caratGain.eventDetails.map((evt, i) => (
                          <div key={i} className="flex justify-between text-[10px] text-neutral-600">
                            <span className="truncate mr-2">{evt.name}</span>
                            <span className="shrink-0 text-neutral-500">+{evt.carats}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
