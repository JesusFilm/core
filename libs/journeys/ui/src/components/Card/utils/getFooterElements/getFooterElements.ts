import { SxProps } from '@mui/material/styles'

import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'

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

export function getFooterSpacing({
  journey,
  variant = 'default'
}: JourneyInfoProps): SxProps {
  let mobileFooterSpacing = 0

  if (journey?.website === true) {
    mobileFooterSpacing = 0
  } else {
    const hasTopRow = hasReactions({ journey })
    const hasBottomRow =
      hasHostAvatar({ journey, variant }) ||
      hasHostDetails({ journey }) ||
      hasChatWidget({ journey, variant }) ||
      hasTitle({ journey }) != null

    if (hasTopRow && hasBottomRow) {
      mobileFooterSpacing = 28
    } else if (hasTopRow || hasBottomRow) {
      mobileFooterSpacing = 14
    } else {
      mobileFooterSpacing = 2
    }
  }

  return {
    mb: {
      xs: mobileFooterSpacing,
      sm: 10
    }
  }
}
