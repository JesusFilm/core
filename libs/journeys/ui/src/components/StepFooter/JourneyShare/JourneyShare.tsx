import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Share from '@core/shared/ui/icons/Share'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { useJourney } from '../../../libs/JourneyProvider'
import { CustomChip } from '../CustomChip'
import facebookLogo from './images/facebook_logo.svg'
import twitterLogo from './images/twitter_logo.svg'

const StyledIconButton = styled(IconButton)<
  IconButtonProps & { href?: string; target?: string; rel?: string }
>(({ theme }) => ({
  width: '40px',
  height: '40px',
  backgroundColor: `${theme.palette.grey[700]}FF`,
  '&:hover': {
    backgroundColor: `${theme.palette.grey[700]}FF`
  },
  m: 2
}))

export function JourneyShare(): ReactElement {
  const { journey, admin } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('libs-journeys-ui')

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

  async function handleCopyLink(): Promise<void> {
    if (url == null) return
    await navigator.clipboard.writeText(url).then(() => {
      enqueueSnackbar(t('Copied to clipboard'), {
        variant: 'success',
        preventDuplicate: true
      })
    })
  }

  return (
    <>
      <CustomChip handleClick={handleShare}>
        <Share />
      </CustomChip>

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        dialogTitle={{
          title: 'Share',
          closeButton: true
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="space-around">
          <Stack direction="column" alignItems="center" spacing={2}>
            <StyledIconButton onClick={handleCopyLink} size="large">
              <LinkAngled sx={{ color: 'white' }} />
            </StyledIconButton>
            <Typography>{t('Copy Link')}</Typography>
          </Stack>

          <Stack direction="column" alignItems="center" spacing={2}>
            <span>
              <StyledIconButton
                href={`https://www.facebook.com/sharer/sharer.php?u=${
                  url ?? ''
                }`}
                target="_blank"
                rel="noopener"
                size="large"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={facebookLogo}
                  alt="facebook-logo"
                  data-testId="facebook-logo"
                  height={40}
                  width={40}
                />
              </StyledIconButton>
            </span>

            <Typography>{t('Facebook')}</Typography>
          </Stack>

          <Stack direction="column" alignItems="center" spacing={2}>
            <span>
              <StyledIconButton
                href={`https://twitter.com/intent/tweet?url=${url ?? ''}`}
                target="_blank"
                rel="noopener"
                size="large"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={twitterLogo}
                  alt="twitter-logo"
                  data-testId="twitter-logo"
                  height={40}
                  width={40}
                />
              </StyledIconButton>
            </span>

            <Typography>{t('Twitter')}</Typography>
          </Stack>
        </Stack>
      </Dialog>
    </>
  )
}
