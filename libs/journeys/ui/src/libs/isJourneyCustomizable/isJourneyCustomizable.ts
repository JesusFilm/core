import { checkBlocksForCustomizableLinks } from '../checkBlocksForCustomizableLinks'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

export function isJourneyCustomizable(journey?: Journey): boolean {
  const blocks = journey?.blocks ?? []

  const hasCustomizableLinks = checkBlocksForCustomizableLinks(blocks)

  const hasEditableText = Boolean(
    journey?.journeyCustomizationDescription &&
      journey?.journeyCustomizationDescription.trim() !== '' &&
      journey?.journeyCustomizationFields &&
      journey?.journeyCustomizationFields.length > 0
  )

  return hasEditableText || hasCustomizableLinks
}
