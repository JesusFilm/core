import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyProviderContext } from '../../../../libs/JourneyProvider/JourneyProvider'

export function showHeader(
  journey?: JourneyFields,
  variant?: JourneyProviderContext['variant']
): boolean {
  if (journey == null || variant == null) return false

  if (variant === 'admin') {
    return true
  } else {
    return journey.menuButtonIcon != null || journey.logoImageBlock != null
  }
}
