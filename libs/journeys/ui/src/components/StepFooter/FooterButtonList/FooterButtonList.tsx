import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'

import { ReactionButton } from './ReactionButton'
import { ShareButton } from './ShareButton'
import { AiChatButton } from '../../AiChatButton'

export function FooterButtonList(): ReactElement {
  const { journey } = useJourney()

  const showShareButton = journey?.showShareButton ?? true
  const showLikeButton = journey?.showLikeButton ?? true
  const showDislikeButton = journey?.showDislikeButton ?? true

  function isInIframe(): boolean {
    try {
      return window.self !== window.top
    } catch {
      return true
    }
  }

  return (
    <Stack direction="row" gap={2.5} data-testid="StepFooterButtonList">
      {showShareButton && <ShareButton />}
      {showLikeButton && <ReactionButton variant="thumbsup" />}
      {showDislikeButton && <ReactionButton variant="thumbsdown" />}
      {showShareButton &&
        showLikeButton &&
        showDislikeButton &&
        !isInIframe() && <AiChatButton />}
    </Stack>
  )
}
