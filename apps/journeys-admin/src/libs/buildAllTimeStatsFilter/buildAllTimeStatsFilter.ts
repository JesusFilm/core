import { formatISO } from 'date-fns'

import { PlausibleStatsAggregateFilter } from '../../../__generated__/globalTypes'
import { earliestStatsCollected } from '../../components/Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/buildPresetDateRange'

/**
 * Builds the all-time stats filter shared by every template-stats query.
 * Omitting period/date makes the Plausible Stats API silently default to
 * the last 30 days, and every call site must send the same `where` args so
 * queries and refetches read/write the same Apollo cache entry.
 */
export function buildAllTimeStatsFilter(): PlausibleStatsAggregateFilter {
  return {
    period: 'custom',
    date: `${earliestStatsCollected},${formatISO(new Date(), {
      representation: 'date'
    })}`
  }
}
