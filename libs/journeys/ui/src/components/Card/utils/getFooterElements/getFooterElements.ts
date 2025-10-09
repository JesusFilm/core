import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyProviderContext } from '../../../../libs/JourneyProvider/JourneyProvider'

export const FULL_HEIGHT = '90px'
export const HALF_HEIGHT = '60px'
export const MIN_HEIGHT = '8px'
export const WEBSITE_HEIGHT = '0px'

interface JourneyInfoProps {
  journey?: JourneyFields
  variant?: JourneyProviderContext['variant'] | undefined
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
  variant = 'default'
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
  variant = 'default'
}: JourneyInfoProps): string {
  if (journey?.website === true) {
    return HALF_HEIGHT
  } else {
    const hasBottomRow =
      hasReactions({ journey }) ||
      hasHostAvatar({ journey, variant }) ||
      hasHostDetails({ journey }) ||
      hasChatWidget({ journey, variant }) ||
      getTitle({ journey }) != null

    if (hasBottomRow) {
      return HALF_HEIGHT
    } else {
      return MIN_HEIGHT
    }
  }
}
