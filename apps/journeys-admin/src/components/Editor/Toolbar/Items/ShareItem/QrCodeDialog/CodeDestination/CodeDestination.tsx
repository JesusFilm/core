import FilledInput from '@mui/material/FilledInput'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import AlertTriangle from '@core/shared/ui/icons/AlertTriangle'

import { ChangeButton } from './ChangeButton'
import { CodeDestinationPopper } from './CodeDestinationPopper'

const RedirectDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/QrCodeDialog/RedirectDialog" */
      '../RedirectDialog'
    ).then((mod) => mod.RedirectDialog),
  { ssr: false }
)

interface CodeDestinationProps {
  to?: string
  handleChangeTo: (url: string) => void
  disabled?: boolean
}

export function CodeDestination({
  to,
  handleChangeTo,
  disabled = false
}: CodeDestinationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [showRedirectButton, setShowRedirectButton] = useState(false)
  const [showRedirectDialog, setShowRedirectDialog] = useState(false)

  function handleRedirectClick(): void {
    setShowRedirectDialog(true)
  }

  function handleClick(): void {
    setShowRedirectButton(!showRedirectButton)
  }

  return (
    <Stack spacing={5}>
      <Stack direction="row" justifyContent="space-between">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{
            flexGrow: {
              xs: 1,
              sm: 0
            }
          }}
        >
          <Typography variant="subtitle1" color="secondary.dark">
            {t('Code Destination')}
          </Typography>
          <CodeDestinationPopper />
        </Stack>
        <Stack
          direction="row"
          spacing={3}
          sx={{
            display: { xs: 'none', sm: 'flex' }
          }}
        >
          <ChangeButton
            disabled={disabled}
            showRedirectButton={showRedirectButton}
            handleClick={handleClick}
            handleRedirectClick={handleRedirectClick}
          />
        </Stack>
      </Stack>
      <FilledInput
        fullWidth
        hiddenLabel
        value={to}
        onChange={(e) => handleChangeTo(e.target.value)}
        disabled={!showRedirectButton}
      />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={3}
        sx={{ display: { xs: 'flex', sm: 'none' } }}
      >
        <ChangeButton
          disabled={disabled}
          showRedirectButton={showRedirectButton}
          handleClick={handleClick}
        />
      </Stack>
      {showRedirectButton && (
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          sx={{
            p: 4,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            display: {
              xs: 'none',
              sm: 'flex'
            }
          }}
        >
          <AlertTriangle />
          <Typography variant="body2" color="secondary.dark">
            {t(
              'After redirection, the QR code will lead to a different journey.'
            )}
          </Typography>
        </Stack>
      )}
      {showRedirectDialog != null && (
        <RedirectDialog
          open={showRedirectDialog}
          onClose={() => setShowRedirectDialog(false)}
          to={to}
        />
      )}
    </Stack>
  )
}
