import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'

const FULL_HEIGHT = '124px'
const HALF_HEIGHT = '56px'
const MIN_HEIGHT = '8px'
const WEBSITE_HEIGHT = '0px'

interface JourneyInfoProps {
  journey?: JourneyFields
  variant?: 'default' | 'admin' | 'embed' | undefined
}

export function hasReactions({ journey }: JourneyInfoProps): boolean {
  return (
    (journey?.showShareButton === true ||
      journey?.showLikeButton === true ||
      journey?.showDislikeButton === true) ??
    false
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

export function hasTitle({ journey }: JourneyInfoProps): string | null {
  if (journey?.displayTitle == null) {
    return journey?.seoTitle ?? null
  } else if (journey.displayTitle === '') {
    return null
  } else {
    return journey.displayTitle
  }
}

export function getFooterMobileSpacing({
  journey,
  variant = 'default'
}: JourneyInfoProps): string {
  if (journey?.website === true) {
    return WEBSITE_HEIGHT
  } else {
    const hasTopRow = hasReactions({ journey })
    const hasBottomRow =
      hasHostAvatar({ journey, variant }) ||
      hasHostDetails({ journey }) ||
      hasChatWidget({ journey, variant }) ||
      hasTitle({ journey }) != null

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
      hasHostAvatar({ journey, variant }) ||
      hasHostDetails({ journey }) ||
      hasChatWidget({ journey, variant }) ||
      hasTitle({ journey }) != null

    if (hasBottomRow) {
      return HALF_HEIGHT
    } else {
      return MIN_HEIGHT
    }
  }
}
