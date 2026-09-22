import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyProviderContext } from '../../../../libs/JourneyProvider/JourneyProvider'

export function showHeader(
  journey?: JourneyFields,
  renderMode?: JourneyProviderContext['renderMode']
): boolean {
  if (journey == null || renderMode == null) return false

  if (renderMode === 'admin') {
    return true
  } else {
    return journey.menuButtonIcon != null || journey.logoImageBlock != null
  }
}
