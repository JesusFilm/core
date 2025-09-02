import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'

export function showHeader(
  journey?: JourneyFields,
  variant?: 'admin' | 'embed' | 'default'
): boolean {
  if (journey == null || variant == null) return false

  if (variant === 'admin') {
    return true
  } else {
    return journey.menuButtonIcon != null || journey.logoImageBlock != null
  }
}
