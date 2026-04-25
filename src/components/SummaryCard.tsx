import type { MonthlyIncomeResult } from '../utils/calculateMonthlyIncome'

interface Props {
  result: MonthlyIncomeResult
}

export function SummaryCard({ result }: Props) {
  return (
    <section id="summary" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
      <p className="text-sm text-neutral-400 uppercase tracking-widest mb-1">Estimated Monthly Income</p>
      <div className="flex items-baseline gap-4 flex-wrap">
        <span className="text-4xl font-bold text-red-400">{result.carats.toLocaleString()}</span>
        <span className="text-neutral-400 text-sm">carats</span>
        {result.tickets > 0 && (
          <>
            <span className="text-2xl font-semibold text-amber-400">+{result.tickets}</span>
            <span className="text-neutral-400 text-sm">gacha tickets</span>
          </>
        )}
      </div>

      {/* Breakdown */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {result.breakdown.map((item) => (
          <div key={item.label} className="flex justify-between text-sm bg-neutral-900/50 rounded-lg px-3 py-2">
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
    </section>
  )
}
