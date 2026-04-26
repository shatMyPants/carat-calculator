import { useState } from 'react'
import type { Banner, CaratGainResult } from '../types'

interface Props {
  banner: Banner
  caratGain: CaratGainResult | null
  isMinimized?: boolean
  onFocus?: () => void
}

export function BannerDetail({ banner, caratGain, isMinimized, onFocus }: Props) {
  const [showEventDetails, setShowEventDetails] = useState(false)

  if (isMinimized) {
    return (
      <div 
        onClick={onFocus}
        className="h-full min-h-[500px] rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center py-8 cursor-pointer hover:bg-neutral-800/50 transition-colors"
      >
        <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-6">Detail</span>
        <div className="flex flex-col gap-3 items-center">
           <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 overflow-hidden shadow-inner">
              <img 
                src={banner.bannerType === 0 ? "/carat-calculator/images/character.png" : "/carat-calculator/images/support.png"} 
                alt={banner.targets[0]?.charaName} 
                className="w-full h-full object-cover" 
              />
           </div>
           <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-bold text-neutral-400 tracking-tight max-h-[200px] overflow-hidden text-ellipsis">
             {banner.targets[0]?.charaName}
           </span>
        </div>
      </div>
    )
  }

  return (
    <section id="banner-detail" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
      {/* Banner Image */}
      <div className="mb-6 rounded-xl overflow-hidden border border-[var(--vp-c-border)] aspect-[21/9] bg-[var(--vp-c-bg-alt)]">
        <img 
          src="/carat-calculator/images/banner.png" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-80" 
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>

      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-xl font-bold text-[var(--vp-c-text-1)]">
          {banner.targets[0]?.charaName}
          {banner.targets.length > 1 && ` & ${banner.targets.length - 1} more`}
        </h2>
        <span className="text-xs font-black uppercase tracking-widest text-neutral-500">
          {banner.bannerType === 0 ? 'Character Banner' : 'Support Banner'}
        </span>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--vp-c-text-2)] font-medium">
          <span className="text-[10px] uppercase font-black tracking-tighter text-neutral-600">EN Window</span>
          <span>{new Date(banner.en_start_date * 1000).toLocaleDateString()} — {new Date(banner.en_end_date * 1000).toLocaleDateString()}</span>
          {banner.is_predicted && <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-800/30">Predicted</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500 italic">
          <span className="text-[10px] uppercase font-black tracking-tighter text-neutral-700 not-italic">JP Original</span>
          <span>{new Date(banner.start_date * 1000).toLocaleDateString()} — {new Date(banner.end_date * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {banner.targets.map((t, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--vp-c-bg-alt)] border border-[var(--vp-c-border)]">
            <div className="w-16 h-16 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 shadow-inner">
              <img 
                src={banner.bannerType === 0 ? "/carat-calculator/images/character.png" : "/carat-calculator/images/support.png"} 
                alt={t.charaName} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-bold text-[var(--vp-c-text-1)] truncate leading-tight mb-1">{t.charaName}</div>
              <div className="text-[11px] text-[var(--vp-c-text-3)] font-medium line-clamp-2 leading-relaxed">{t.cardTitle || t.supportCardTitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Carat Gain Breakdown */}
      {caratGain && (
        <div className="border-t border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Estimated Gain ({caratGain.daysInWindow} days)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Free Carat Estimate</span>
              <span className="text-3xl font-bold text-emerald-400">
                {(caratGain.carats - caratGain.paidCarats).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Paid Carat Estimate</span>
              <span className="text-2xl font-bold text-amber-500">
                {caratGain.paidCarats.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 flex-wrap mb-4 border-t border-neutral-800 pt-3">
             <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Total Pulls</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-100">
                    {Math.floor(caratGain.carats / 150) + caratGain.tickets}
                  </span>
                  <span className="text-neutral-500 text-xs">pulls</span>
                </div>
             </div>
            {caratGain.tickets > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Gacha Tickets</span>
                <span className="text-xl font-semibold text-amber-400">
                  {caratGain.tickets}
                </span>
              </div>
            )}
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {caratGain.breakdown.map((item) => (
              <div
                key={item.label}
                className="flex justify-between text-sm bg-neutral-800/40 rounded-lg px-3 py-2"
              >
                <span className="text-neutral-300">{item.label}</span>
                <span className="font-medium text-neutral-100">
                  {item.carats.toLocaleString()}
                  {item.tickets > 0 && (
                    <span className="text-amber-400 ml-2">+{item.tickets}🎫</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Collapsible event details */}
          {caratGain.eventDetails.length > 0 && (
            <div>
              <button
                onClick={() => setShowEventDetails((v) => !v)}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showEventDetails ? '▾' : '▸'} Show {caratGain.eventDetails.length} event details
              </button>
              {showEventDetails && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1 pl-3 border-l border-neutral-800">
                  {caratGain.eventDetails.map((evt, i) => (
                    <div key={i} className="flex justify-between text-xs text-neutral-400">
                      <span className="truncate mr-2">{evt.name}</span>
                      <span className="shrink-0 text-neutral-300">{evt.carats}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
