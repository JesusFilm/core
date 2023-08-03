import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ShareIcon from '@core/shared/ui/icons/Share'
import { StyledFooterButton } from '../StyledFooterButton'
import { RenderLocation, useJourney } from '../../../../libs/JourneyProvider'
import { ShareDialog } from './ShareDialog'

export function ShareButton(): ReactElement {
  const { journey, renderLocation } = useJourney()
  const { t } = useTranslation('libs-journeys-ui')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const url =
    journey?.slug != null
      ? `https://your.nextstep.is/${journey.slug}`
      : undefined

  async function handleShare(): Promise<void> {
    if (renderLocation === RenderLocation.Admin || url == null) return
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
      <StyledFooterButton onClick={handleShare}>
        <ShareIcon />
      </StyledFooterButton>
      <ShareDialog
        url={url}
        open={shareDialogOpen}
        closeDialog={() => setShareDialogOpen(false)}
      />
    </>
  )
}
