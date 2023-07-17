import { ReactElement, useState } from 'react'
import ShareIcon from '@core/shared/ui/icons/Share'
import { StyledFooterButton } from '../StyledFooterButton'
import { useJourney } from '../../../../libs/JourneyProvider'
import { ShareDialog } from './ShareDialog'

export function ShareButton(): ReactElement {
  const { journey, admin } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const url =
    journey?.slug != null
      ? `https://your.nextstep.is/${journey.slug}`
      : undefined

  async function handleShare(): Promise<void> {
    if (admin || url == null) return
    if (navigator.share == null) return setShareDialogOpen(true)

    const shareDetails = {
      url,
      title: journey?.seoTitle ?? journey?.title ?? 'Journey',
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
