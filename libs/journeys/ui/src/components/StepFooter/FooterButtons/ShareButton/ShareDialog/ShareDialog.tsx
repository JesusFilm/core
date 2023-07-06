import { ReactElement } from 'react'
import { useSnackbar } from 'notistack'
import { Dialog } from '@core/shared/ui/Dialog'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { useTranslation } from 'react-i18next'
import facebookLogo from './images/facebook_logo.svg'
import twitterLogo from './images/twitter_logo.svg'

const StyledIconButton = styled(IconButton)<
  IconButtonProps & { href?: string; target?: string; rel?: string }
>(({ theme }) => ({
  width: '40px',
  height: '40px',
  backgroundColor: `${theme.palette.grey[700]}FF`,
  '&:hover': {
    backgroundColor: `${theme.palette.grey[700]}BF`
  },
  m: 2
}))

interface Props {
  url?: string
  open: boolean
  closeDialog: () => void
}

export function ShareDialog({ url, open, closeDialog }: Props): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('libs-journeys-ui')

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
    <Dialog
      open={open}
      onClose={closeDialog}
      dialogTitle={{
        title: 'Share',
        closeButton: true
      }}
    >
      <Stack direction="row" justifyContent="space-around">
        <Stack
          direction="column"
          alignItems="center"
          spacing={2}
          sx={{ minWidth: '55px' }}
        >
          <StyledIconButton onClick={handleCopyLink} size="large">
            <LinkAngled sx={{ color: 'white' }} />
          </StyledIconButton>
          <Typography variant="caption">{t('Copy Link')}</Typography>
        </Stack>

        <Stack
          direction="column"
          alignItems="center"
          spacing={2}
          sx={{ minWidth: '55px' }}
        >
          <span>
            <StyledIconButton
              href={`https://www.facebook.com/sharer/sharer.php?u=${url ?? ''}`}
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

          <Typography variant="caption">{t('Facebook')}</Typography>
        </Stack>

        <Stack
          direction="column"
          alignItems="center"
          spacing={2}
          sx={{ minWidth: '55px' }}
        >
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

          <Typography variant="caption">{t('Twitter')}</Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}
