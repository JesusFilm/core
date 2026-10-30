import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import type { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

/** The page props the page direction is read from: a journey page's journey, a campaign page's campaign. */
export interface PageRTLProps {
  journey?: Journey
  campaign?: { language?: { bcp47?: string | null } | null } | null
}

/**
 * Whether the page's emotion cache compiles right-to-left CSS: a campaign
 * page follows its resolved Page Language (glossary: Page Language
 * resolution), a journey page its journey's language, anything else is
 * left-to-right.
 */
export function getPageRTL(pageProps: PageRTLProps): boolean {
  const campaignBcp47 = pageProps.campaign?.language?.bcp47
  if (campaignBcp47 != null) return getLocaleRTL(campaignBcp47)
  return getJourneyRTL(pageProps.journey).rtl
}
