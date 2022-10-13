import { getLocaleRTL } from '@core/shared/ui/rtl'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

export function getJourneyRTL(
  journey: Pick<Journey, 'language'> | undefined
): boolean {
  // Currently just check for bcp47 codes
  const locale = journey?.language.bcp47 ?? ''

  return getLocaleRTL(locale)
}
