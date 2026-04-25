import { useState } from 'react'
import type { Banner, CaratGainResult } from '../types'

interface Props {
  banner: Banner
  caratGain: CaratGainResult | null
}

export function BannerDetail({ banner, caratGain }: Props) {
  const [showEventDetails, setShowEventDetails] = useState(false)

  return (
    <section id="banner-detail" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
      <h2 className="text-lg font-semibold mb-3">
        Selected Banner #{banner.id}
        <span className="ml-2 text-sm text-neutral-500">
          ({banner.bannerType === 0 ? 'Character' : 'Support'})
        </span>
      </h2>
      <p className="text-sm text-neutral-400 mb-3">
        EN: {new Date(banner.en_start_date * 1000).toLocaleDateString()} — {new Date(banner.en_end_date * 1000).toLocaleDateString()}
        {banner.is_predicted && <span className="ml-2 text-blue-400/80">(Predicted)</span>}
      </p>
      <p className="text-xs text-neutral-500 mb-3 italic">
        JP: {new Date(banner.start_date * 1000).toLocaleDateString()} — {new Date(banner.end_date * 1000).toLocaleDateString()}
      </p>
      <div className="space-y-1 mb-4">
        {banner.targets.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-red-400">★</span>
            <span className="font-medium">{t.charaName}</span>
            <span className="text-neutral-500">{t.cardTitle ?? t.supportCardTitle}</span>
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
