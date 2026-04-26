/* ------------------------------------------------------------------ */
/*  Shared constants                                                  */
/* ------------------------------------------------------------------ */

export const EN_LAUNCH = 1750896000
export const JP_LAUNCH = 1614124800

/* ------------------------------------------------------------------ */
/*  Banner types                                                      */
/* ------------------------------------------------------------------ */

export interface BannerTarget {
  cardId?: number
  charaId?: number
  charaName: string
  cardTitle?: string
  supportCardId?: number
  supportCardTitle?: string
}

export interface Banner {
  id: number
  bannerType: number
  bannerImageId: number
  start_date: number
  end_date: number
  en_start_date: number
  en_end_date: number
  is_predicted: boolean
  targets: BannerTarget[]
}

/* ------------------------------------------------------------------ */
/*  Income types                                                      */
/* ------------------------------------------------------------------ */

export interface IncomeSelections {
  team_trial_weekly: string
  club_rank_monthly: string
  champions_meeting: string
  league_of_heroes: string
  daily_carats_pack: boolean
}

export interface SelectedBanner {
  bannerId: number
  pulls: number
}

/* ------------------------------------------------------------------ */
/*  Event / PvP types                                                 */
/* ------------------------------------------------------------------ */

export interface JpEvent {
  jpstart: number
  jpend: number
  carat_rewards: number
  name: string
}

export interface PvpEvent {
  type: string
  id: number
  jp_start: number
  jp_end: number
  en_start: number | null
  en_end: number | null
}

/* ------------------------------------------------------------------ */
/*  Calculation result types                                          */
/* ------------------------------------------------------------------ */

export interface BreakdownItem {
  label: string
  carats: number
  tickets: number
}

export interface CaratGainResult {
  carats: number
  paidCarats: number
  tickets: number
  daysInWindow: number
  breakdown: BreakdownItem[]
  /** Individual events that contribute, for optional detailed view */
  eventDetails: { name: string; carats: number }[]
}

/* ------------------------------------------------------------------ */
/*  Timeline types (used by TimelinePage and buildTimeline)            */
/* ------------------------------------------------------------------ */

export interface RawBanner {
  id: number
  bannerType: number
  bannerImageId: number
  jpStartDate: number
  jpEndDate: number
  enStartDate: number | "NONE"
  enEndDate: number | "NONE"
  timeFromJPLaunch: number
  timeFromENLaunch: number
  targets: BannerTarget[]
}

export interface RawEvent {
  jpstart: number
  jpend: number
  carat_rewards: number
  name: string
}

export interface RawPvp {
  type: string
  id: number
  jp_start: number
  jp_end: number
  en_start: number | null
  en_end: number | null
}

/** Unified timeline entry */
export type TimelineEntry =
  | { kind: 'banner'; jpStart: number; jpEnd: number; enStart: number; enEnd: number; isPredicted: boolean; data: RawBanner }
  | { kind: 'event';  jpStart: number; jpEnd: number; enStart: number; enEnd: number; isPredicted: boolean; data: RawEvent }
  | { kind: 'pvp';    jpStart: number; jpEnd: number; enStart: number; enEnd: number; isPredicted: boolean; data: RawPvp }
