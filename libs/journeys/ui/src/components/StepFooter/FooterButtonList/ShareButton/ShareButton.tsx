import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { ReactElement, useState } from 'react'

import ShareIcon from '@core/shared/ui/icons/Share'

import { useBlocks } from '../../../../libs/block'
import { JourneyPlausibleEvents } from '../../../../libs/JourneyPlausibleEvents'
import { useJourney } from '../../../../libs/JourneyProvider'
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
    journey?.slug != null
      ? `https://your.nextstep.is/${journey.slug}`
      : undefined

  async function handleShare(): Promise<void> {
    if (variant === 'admin' || url == null) return

    if (journey != null) {
      const input = {
        blockId: activeBlock?.id
      }
      plausible('shareButtonClick', {
        u: journey.id,
        props: { ...input, key: `shareButtonClick:${input.blockId}` }
      })
    }

    if (navigator.share == null) return setShareDialogOpen(true)

    const shareDetails = {
      url,
      title: journey?.seoTitle ?? journey?.title ?? t('Journey'),
      text: journey?.seoDescription ?? ''
    }

    await navigator.share(shareDetails)
  }

  return (
    <>
      <StyledFooterButton onClick={handleShare} data-testid="ShareButton">
        <ShareIcon sx={{ fontSize: 20 }} />
      </StyledFooterButton>
      <ShareDialog
        url={url}
        open={shareDialogOpen}
        closeDialog={() => setShareDialogOpen(false)}
      />
    </>
  )
}
