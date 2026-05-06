import type { TreeBlock } from '../../../../libs/block'
import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyProviderContext } from '../../../../libs/JourneyProvider/JourneyProvider'
import { CardFields } from '../../__generated__/CardFields'

export const FULL_HEIGHT = '90px'
export const HALF_HEIGHT = '60px'
export const MIN_HEIGHT = '8px'
export const WEBSITE_HEIGHT = '0px'

interface JourneyInfoProps {
  journey?: JourneyFields
  variant?: JourneyProviderContext['variant'] | undefined
  /**
   * Active card. When omitted, `hasAiChatButton` falls back to
   * `journey.showAssistant`. Pass through from any consumer that knows the
   * current card so per-card opt-in/out wins over the journey value.
   */
  card?: TreeBlock<CardFields> | null
}

export function hasReactions({ journey }: JourneyInfoProps): boolean {
  return (
    journey?.showShareButton === true ||
    journey?.showLikeButton === true ||
    journey?.showDislikeButton === true
  )
}

export function hasHostAvatar({
  journey,
  variant = 'default'
}: JourneyInfoProps): boolean {
  return (
    variant === 'admin' ||
    journey?.host?.src1 != null ||
    journey?.host?.src2 != null
  )
}

export function hasHostDetails({ journey }: JourneyInfoProps): boolean {
  return journey?.host != null
}

export function hasChatWidget({
  journey,
  variant = 'default'
}: JourneyInfoProps): boolean {
  return (
    variant === 'admin' ||
    (journey?.chatButtons != null && journey?.chatButtons.length > 0)
  )
}

export function hasAiChatButton({
  journey,
  variant = 'default',
  card
}: JourneyInfoProps): boolean {
  if (variant === 'admin' || variant === 'embed') return false
  // Per-card overrides per-journey; nullish fallback to the (deprecated)
  // journey value during the NES-1585 transition. Removal is tracked in
  // NES-1624 ("Fallback removal") once verification SQL confirms zero
  // remaining nulls on Block.showAssistant.
  return (card?.showAssistant ?? journey?.showAssistant) === true
}

export function getTitle({ journey }: JourneyInfoProps): string | null {
  if (journey?.displayTitle == null) {
    return journey?.seoTitle ?? null
  } else if (journey.displayTitle === '') {
    return null
  } else {
    return journey.displayTitle
  }
}

export function hasCombinedFooter({
  journey,
  variant = 'default'
}: JourneyInfoProps): boolean {
  const hasHost =
    hasHostAvatar({ journey, variant }) || hasHostDetails({ journey })
  const title = getTitle({ journey })
  const reactions = hasReactions({ journey })

  return reactions && title == null && !hasHost && variant !== 'admin'
}

export function getFooterMobileSpacing({
  journey,
  variant = 'default',
  card
}: JourneyInfoProps): string {
  if (journey?.website === true) {
    return variant === 'admin' ? HALF_HEIGHT : WEBSITE_HEIGHT
  } else {
    const hasHost =
      hasHostAvatar({ journey, variant }) || hasHostDetails({ journey })
    const title = getTitle({ journey })
    const reactions = hasReactions({ journey })

    const hasTopRow = reactions && !hasCombinedFooter({ journey, variant })
    const hasBottomRow =
      hasHost ||
      hasChatWidget({ journey, variant }) ||
      hasAiChatButton({ journey, variant, card }) ||
      title != null ||
      reactions

    if (hasTopRow && hasBottomRow) {
      return FULL_HEIGHT
    } else if (hasTopRow || hasBottomRow) {
      return HALF_HEIGHT
    } else {
      return MIN_HEIGHT
    }
  }
}

export function getFooterMobileHeight({
  journey,
  variant = 'default',
  card
}: JourneyInfoProps): string {
  if (journey?.website === true) {
    return HALF_HEIGHT
  } else {
    const hasBottomRow =
      hasReactions({ journey }) ||
      hasHostAvatar({ journey, variant }) ||
      hasHostDetails({ journey }) ||
      hasChatWidget({ journey, variant }) ||
      hasAiChatButton({ journey, variant, card }) ||
      getTitle({ journey }) != null

    if (hasBottomRow) {
      return HALF_HEIGHT
    } else {
      return MIN_HEIGHT
    }
  }
}
