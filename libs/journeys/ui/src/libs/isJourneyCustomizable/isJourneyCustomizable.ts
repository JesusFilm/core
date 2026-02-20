import { checkBlocksForCustomizableLinks } from '../checkBlocksForCustomizableLinks'
import { checkBlocksForCustomizableMedia } from '../checkBlocksForCustomizableMedia'
import { JourneyFields_blocks as Block } from '../JourneyProvider/__generated__/JourneyFields'

interface JourneyForCustomizableCheck {
  blocks?: unknown[] | null
  journeyCustomizationDescription?: string | null
  journeyCustomizationFields?: Array<{
    key: string
    value?: string | null
  }> | null
}

export function isJourneyCustomizable(
  
  journey?: JourneyForCustomizableCheck
,
  customizableMedia: boolean = false
): boolean {
  const blocks = (journey?.blocks as Block[] | null | undefined) ?? []

  const hasCustomizableLinks = checkBlocksForCustomizableLinks(blocks)

  const hasEditableText = Boolean(
    journey?.journeyCustomizationDescription &&
      journey?.journeyCustomizationDescription.trim() !== '' &&
      journey?.journeyCustomizationFields &&
      journey?.journeyCustomizationFields.length > 0
  )

  const hasCustomizableMedia =
    customizableMedia &&
    checkBlocksForCustomizableMedia(blocks, journey?.logoImageBlock)

  return hasEditableText || hasCustomizableLinks || hasCustomizableMedia
}
