import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { GetPlausibleStatsBreakdown_journeysPlausibleStatsBreakdown as StatsBreakdown } from '../../../../../../../../../__generated__/GetPlausibleStatsBreakdown'

interface StepAnalytics {
  views: number
  visitDuration: string
  bouncePercentage: number | null
}

export function getStepAnalytics(
  page: StatsBreakdown | undefined
): StepAnalytics | undefined {
  if (page == null) {
    return undefined
  }

  const { pageviews, visitDuration, bounceRate } = page

  const stats: StepAnalytics = {
    views: pageviews ?? 0,
    visitDuration: secondsToTimeFormat(visitDuration ?? 0, {
      trimZeroes: true
    }),
    bouncePercentage: null
  }

  if (bounceRate != null && stats.views > 0) {
    stats.bouncePercentage = Math.trunc(bounceRate / stats.views) / 100
  }

  return stats
}
