import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { checkBlocksForCustomizableLinks } from '../checkBlocksForCustomizableLinks'

export interface IsCustomizableReturn {
  hasEditableText: boolean
  hasCustomizableLinks: boolean
}

export function isJourneyCustomizable(journey: Journey): IsCustomizableReturn {
  const blocks = journey.blocks ?? []

  const hasCustomizableLinks = checkBlocksForCustomizableLinks(blocks)

  const hasEditableText = Boolean(
    journey?.journeyCustomizationDescription &&
      journey.journeyCustomizationDescription.trim() !== '' &&
      journey?.journeyCustomizationFields &&
      journey.journeyCustomizationFields.length > 0
  )

  return {
    hasEditableText,
    hasCustomizableLinks
  }
}
