import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Share from '@core/shared/ui/icons/Share'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
// import Image from 'next/image'
import { useSnackbar } from 'notistack'
// import facebookLogo from '../../../../public/facebook_logo.svg'
// import twitterLogo from '../../../../public/twitter_logo.svg'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import { useJourney } from '../../../libs/JourneyProvider'

export function JourneyShare(): ReactElement {
  const { journey, admin } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

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
      try {
        await navigator.share(shareDetails)
      } catch {
        setShareDialogOpen(true)
      }
    } else {
      setShareDialogOpen(true)
    }
  }

  async function handleCopyLink(): Promise<void> {
    if (url == null) return
    await navigator.clipboard.writeText(url).then(() => {
      enqueueSnackbar('Copied to clipboard', { variant: 'success' })
    })
  }

  return (
    <>
      <Chip
        label="Share"
        variant="filled"
        icon={<Share />}
        onClick={handleShare}
      />

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
              onClick={handleCopyLink}
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
            <span>
              <IconButton
                href={`https://www.facebook.com/sharer/sharer.php?u=${
                  url ?? ''
                }`}
                target="_blank"
                rel="noopener"
                size="large"
                sx={{
                  backgroundColor: '#6D6F81',
                  width: '40px',
                  height: '40px',
                  m: 2
                }}
              >
                <FacebookIcon />
                {/* <Image
                  src={facebookLogo}
                  alt="facebook-logo"
                  height={40}
                  width={40}
                /> */}
              </IconButton>
            </span>

            <Typography>Facebook</Typography>
          </Stack>

          <Stack direction="column">
            <span>
              <IconButton
                href={`https://twitter.com/intent/tweet?url=${url ?? ''}`}
                target="_blank"
                rel="noopener"
                size="large"
                sx={{
                  backgroundColor: '#6D6F81',
                  width: '40px',
                  height: '40px',
                  m: 2
                }}
              >
                <TwitterIcon />
                {/* <Image
                  src={twitterLogo}
                  alt="twitter-logo"
                  height={40}
                  width={40}
                /> */}
              </IconButton>
            </span>

            <Typography>Twitter</Typography>
          </Stack>
        </Stack>
      </Dialog>
    </>
  )
}
