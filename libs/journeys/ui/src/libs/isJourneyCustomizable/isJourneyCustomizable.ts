import { checkBlocksForCustomizableLinks } from '../checkBlocksForCustomizableLinks'
import { checkBlocksForCustomizableMedia } from '../checkBlocksForCustomizableMedia'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

export function isJourneyCustomizable(
  journey?: Journey,
  customizableMedia?: boolean
): boolean {
  const blocks = journey?.blocks ?? []

  const hasCustomizableLinks = checkBlocksForCustomizableLinks(blocks)

  const hasEditableText = Boolean(
    journey?.journeyCustomizationDescription &&
      journey?.journeyCustomizationDescription.trim() !== '' &&
      journey?.journeyCustomizationFields &&
      journey?.journeyCustomizationFields.length > 0
  )

  const hasCustomizableMedia =
    Boolean(customizableMedia) &&
    checkBlocksForCustomizableMedia(blocks, journey?.logoImageBlock)

  return hasEditableText || hasCustomizableLinks || hasCustomizableMedia
}
