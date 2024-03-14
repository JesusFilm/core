import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import ShareIcon from '@core/shared/ui/icons/Share'

import { useJourney } from '../../../../libs/JourneyProvider'
import { StyledFooterButton } from '../StyledFooterButton'

import { ShareDialog } from './ShareDialog'

export function ShareButton(): ReactElement {
  const { journey, variant } = useJourney()
  const { t } = useTranslation('libs-journeys-ui')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const url =
    journey?.slug != null
      ? `https://your.nextstep.is/${journey.slug}`
      : undefined

  async function handleShare(): Promise<void> {
    if (variant === 'admin' || url == null) return
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
