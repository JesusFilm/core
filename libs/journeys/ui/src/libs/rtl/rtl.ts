import { isRtl } from '../../../../../shared/ui/src/libs/rtl'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

export function getJourneyRtl(journey: Journey | undefined): boolean {
  // Currently just check for bcp47 codes
  const locale = journey?.language.bcp47 ?? ''

  return isRtl(locale)
}
