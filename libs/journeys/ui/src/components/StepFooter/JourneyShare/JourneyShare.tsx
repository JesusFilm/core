import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Share from '@core/shared/ui/icons/Share'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Image from 'next/image'
import { useJourney } from '../../../libs/JourneyProvider'
import facebookLogo from '../../../../public/facebook_logo.svg'
import twitterLogo from '../../../../public/twitter_logo.svg'

export function JourneyShare(): ReactElement {
  const { journey } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(true)

  async function handleShare(): Promise<void> {
    if (journey?.slug == null) return

    const url = `${
      process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'
    }/${journey.slug}`

    const shareDetails = {
      url,
      title: journey?.seoTitle ?? 'Untitled Journey',
      text: journey?.seoDescription ?? ''
    }

    if (navigator.share != null) {
      try {
        await navigator.share(shareDetails)
      } catch {
        setShareDialogOpen(true)
      }
    } else {
      setShareDialogOpen(true)
    }
  }

  return (
    <>
      <Chip label="Share" icon={<Share />} onClick={handleShare} />

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        dialogTitle={{
          title: 'Share',
          closeButton: true
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="space-around">
          <Stack direction="column">
            <IconButton
              size="large"
              sx={{
                backgroundColor: '#6D6F81',
                width: '40px',
                height: '40px',
                m: 2
              }}
            >
              <LinkAngled />
            </IconButton>
            <Typography>Custom</Typography>
          </Stack>

          <Stack direction="column">
            <IconButton>
              <Image
                src={facebookLogo}
                alt="facebook-logo"
                height={40}
                width={40}
              />
            </IconButton>
            <Typography>Facebook</Typography>
          </Stack>

          <Stack direction="column">
            <IconButton>
              <Image
                src={twitterLogo}
                alt="twitter-logo"
                height={40}
                width={40}
              />
            </IconButton>
            <Typography>Twitter</Typography>
          </Stack>
        </Stack>
      </Dialog>
    </>
  )
}
