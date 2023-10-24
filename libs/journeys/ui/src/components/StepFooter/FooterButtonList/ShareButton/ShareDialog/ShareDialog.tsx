import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import FacebookLogo from '@core/shared/ui/icons/FacebookLogo'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import TwitterLogo from '@core/shared/ui/icons/TwitterLogo'

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

interface ShareDialogProps {
  url?: string
  open: boolean
  closeDialog: () => void
}

export function ShareDialog({
  url,
  open,
  closeDialog
}: ShareDialogProps): ReactElement {
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

  let element: HTMLElement | undefined
  if (typeof window !== 'undefined') {
    element =
      document.getElementById('embed-fullscreen-container') ?? document.body
  }

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      dialogTitle={{
        title: t('Share'),
        closeButton: true
      }}
      container={element}
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
          <StyledIconButton
            href={`https://www.facebook.com/sharer/sharer.php?u=${url ?? ''}`}
            target="_blank"
            rel="noopener"
            size="large"
          >
            <FacebookLogo sx={{ fontSize: '48px' }} />
          </StyledIconButton>
          <Typography variant="caption">{t('Facebook')}</Typography>
        </Stack>

        <Stack
          direction="column"
          alignItems="center"
          spacing={2}
          sx={{ minWidth: '55px' }}
        >
          <StyledIconButton
            href={`https://twitter.com/intent/tweet?url=${url ?? ''}`}
            target="_blank"
            rel="noopener"
            size="large"
          >
            <TwitterLogo sx={{ fontSize: '48px' }} />
          </StyledIconButton>
          <Typography variant="caption">{t('Twitter')}</Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}
