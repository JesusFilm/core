import { ReactElement, useState } from 'react'
import Share from '@core/shared/ui/icons/Share'
import { FooterButton } from '../FooterButton'
import { useJourney } from '../../../../libs/JourneyProvider'
import { ShareDialog } from './ShareDialog'

export function ShareButton(): ReactElement {
  const { journey, admin } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const url =
    journey?.slug != null
      ? `${
          process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'
        }/${journey.slug}`
      : undefined

  async function handleShare(): Promise<void> {
    if (admin || url == null) return
    const shareDetails = {
      url,
      title: journey?.seoTitle ?? journey?.title ?? 'Journey',
      text: journey?.seoDescription ?? ''
    }

    if (navigator.share != null) {
      await navigator.share(shareDetails)
    } else {
      setShareDialogOpen(true)
    }
  }

  return (
    <>
      <FooterButton handleClick={handleShare}>
        <Share />
      </FooterButton>
      <ShareDialog
        url={url}
        open={shareDialogOpen}
        closeDialog={() => setShareDialogOpen(false)}
      />
    </>
  )
}
