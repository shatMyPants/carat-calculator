import incomeData from '../../income.json'
import type { IncomeSelections } from '../types'

// Re-export the type so existing imports from this file still work
export type { IncomeSelections }

/* ------------------------------------------------------------------ */
/*  Helpers to derive dropdown options from income.json               */
/* ------------------------------------------------------------------ */

const teamTrialOptions = Object.keys(incomeData.free_income.team_trial_weekly)
const clubRankOptions = Object.keys(incomeData.free_income.club_rank_monthly)
const cmOptions = Object.keys(incomeData.free_income.champions_meeting)
const lohOptions = Object.keys(incomeData.free_income.league_of_heroes)

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  selections: IncomeSelections
  onChange: (next: IncomeSelections) => void
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500
                   transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export function IncomeSection({ selections, onChange }: Props) {
  const update = (key: keyof IncomeSelections, value: string | boolean) =>
    onChange({ ...selections, [key]: value })

  return (
    <section id="income-config" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Income Configuration</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectField
          id="select-team-trial"
          label="Team Trial (Weekly)"
          value={selections.team_trial_weekly}
          options={teamTrialOptions}
          onChange={(v) => update('team_trial_weekly', v)}
        />
        <SelectField
          id="select-club-rank"
          label="Club Rank (Monthly)"
          value={selections.club_rank_monthly}
          options={clubRankOptions}
          onChange={(v) => update('club_rank_monthly', v)}
        />
        <SelectField
          id="select-cm"
          label="Champions Meeting"
          value={selections.champions_meeting}
          options={cmOptions}
          onChange={(v) => update('champions_meeting', v)}
        />
        <SelectField
          id="select-loh"
          label="League of Heroes"
          value={selections.league_of_heroes}
          options={lohOptions}
          onChange={(v) => update('league_of_heroes', v)}
        />
      </div>

      {/* Paid pack toggle */}
      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="toggle-daily-pack" className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-daily-pack"
            type="checkbox"
            checked={selections.daily_carats_pack}
            onChange={(e) => update('daily_carats_pack', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-neutral-700 peer-focus:ring-2 peer-focus:ring-red-500/50 rounded-full
                          peer-checked:bg-red-600 transition-colors after:content-[''] after:absolute after:top-[2px]
                          after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4
                          after:transition-all peer-checked:after:translate-x-full" />
        </label>
        <span className="text-sm text-neutral-300">Daily Carats Pack (¥120/month)</span>
      </div>
    </section>
  )
}
