import { getLocaleRTL } from '@core/shared/ui/rtl'

import { JourneyFieldsFragment as Journey } from '../JourneyProvider/__generated__/journeyFields'

export function getJourneyRTL(journey: Pick<Journey, 'language'> | undefined): {
  rtl: boolean
  locale: string
} {
  // Currently just check for bcp47 codes
  const locale = journey?.language.bcp47 ?? ''

  return { rtl: getLocaleRTL(locale), locale }
}
