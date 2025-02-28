import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'

import { ReactionButton } from './ReactionButton'
import { ShareButton } from './ShareButton'

interface FooterButtonListProps {
  sx?: SxProps
}

export function FooterButtonList({
  sx
}: FooterButtonListProps): ReactElement | null {
  const { journey } = useJourney()

  const showShareButton = journey?.showShareButton ?? true
  const showLikeButton = journey?.showLikeButton ?? true
  const showDislikeButton = journey?.showDislikeButton ?? true

  if (!showShareButton && !showLikeButton && !showDislikeButton) return null

  return (
    <Stack direction="row" gap={2.5} data-testid="StepFooterButtonList" sx={sx}>
      {showShareButton && <ShareButton />}
      {showLikeButton && <ReactionButton variant="thumbsup" />}
      {showDislikeButton && <ReactionButton variant="thumbsdown" />}
    </Stack>
  )
}
