import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { ReactElement, useState } from 'react'

import ShareIcon from '@core/shared/ui/icons/Share'

import { useBlocks } from '../../../../libs/block'
import { useJourney } from '../../../../libs/JourneyProvider'
import {
  JourneyPlausibleEvents,
  keyify
} from '../../../../libs/plausibleHelpers'
import { StyledFooterButton } from '../StyledFooterButton'

import { ShareDialog } from './ShareDialog'

export function ShareButton(): ReactElement {
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { journey, variant } = useJourney()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const { t } = useTranslation('libs-journeys-ui')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const url =
    typeof window !== 'undefined' && journey?.slug != null
      ? window.location.href
      : undefined

  async function handleShare(): Promise<void> {
    console.log('here', variant, url)
    if (variant === 'admin' || url == null) return

    if (journey != null) {
      const input = {
        blockId: activeBlock?.id
      }
      const key = keyify({
        stepId: input.blockId ?? '',
        event: 'shareButtonClick',
        blockId: input.blockId
      })
      plausible('shareButtonClick', {
        props: {
          ...input,
          key,
          simpleKey: key
        }
      })
    }

    if (navigator.share == null) return setShareDialogOpen(true)

    const shareDetails = {
      url,
      title: journey?.seoTitle ?? journey?.displayTitle ?? t('Journey'),
      text: journey?.seoDescription ?? ''
    }

    await navigator.share(shareDetails)
  }

  return (
    <>
      <StyledFooterButton onClick={handleShare} data-testid="ShareButton">
        <ShareIcon sx={{ fontSize: 20 }} data-testid="ShareIcon" />
      </StyledFooterButton>
      <ShareDialog
        url={url}
        open={shareDialogOpen}
        closeDialog={() => setShareDialogOpen(false)}
      />
    </>
  )
}
