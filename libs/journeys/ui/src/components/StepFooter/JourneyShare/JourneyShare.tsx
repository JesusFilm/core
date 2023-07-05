import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Share from '@core/shared/ui/icons/Share'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Button, { ButtonProps } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import { useJourney } from '../../../libs/JourneyProvider'
import facebookLogo from './images/facebook_logo.svg'
import twitterLogo from './images/twitter_logo.svg'

const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
  minWidth: 56,
  borderRadius: 20,
  backgroundColor: theme.palette.grey[800],
  '&.hover': {
    backgroundColor: theme.palette.grey[800]
  },
  color: theme.palette.grey[100],
  [theme.breakpoints.down('sm')]: {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? `${theme.palette.grey[200]}26`
        : `${theme.palette.grey[200]}4D`,
    '&.hover': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? `${theme.palette.grey[200]}26`
          : `${theme.palette.grey[200]}4D`
    },
    border: theme.palette.mode === 'dark' ? 'none' : '0.8px solid #0000000D',
    color:
      theme.palette.mode === 'dark'
        ? `${theme.palette.grey[200]}FF`
        : `${theme.palette.grey[800]}FF`
  }
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
      enqueueSnackbar(t('Copied to clipboard'), { variant: 'success' })
    })
  }

  return (
    <>
      <StyledButton onClick={handleShare}>
        <Share />
      </StyledButton>

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
                backgroundColor: '#6D7080FF',
                width: '40px',
                height: '40px',
                m: 2,
                '&:hover': {
                  backgroundColor: '#6D7080FF'
                }
              }}
            >
              <LinkAngled sx={{ color: 'white' }} />
            </IconButton>
            <Typography>{t('Custom')}</Typography>
          </Stack>

          <Stack direction="column" alignItems="center">
            <span>
              <IconButton
                href={`https://www.facebook.com/sharer/sharer.php?u=${
                  url ?? ''
                }`}
                target="_blank"
                rel="noopener"
                size="large"
                sx={{
                  width: '40px',
                  height: '40px',
                  m: 2
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={facebookLogo}
                  alt="facebook-logo"
                  data-testId="facebook-logo"
                  height={40}
                  width={40}
                />
              </IconButton>
            </span>

            <Typography>{t('Facebook')}</Typography>
          </Stack>

          <Stack direction="column" alignItems="center">
            <span>
              <IconButton
                href={`https://twitter.com/intent/tweet?url=${url ?? ''}`}
                target="_blank"
                rel="noopener"
                size="large"
                sx={{
                  width: '40px',
                  height: '40px',
                  m: 2
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={twitterLogo}
                  alt="twitter-logo"
                  data-testId="twitter-logo"
                  height={40}
                  width={40}
                />
              </IconButton>
            </span>

            <Typography>{t('Twitter')}</Typography>
          </Stack>
        </Stack>
      </Dialog>
    </>
  )
}
