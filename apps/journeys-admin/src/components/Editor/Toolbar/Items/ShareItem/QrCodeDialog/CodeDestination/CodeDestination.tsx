import Button from '@mui/material/Button'
import FilledInput from '@mui/material/FilledInput'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import AlertTriangle from '@core/shared/ui/icons/AlertTriangle'

import { CodeDestinationPopper } from './CodeDestinationPopper'

interface CodeDestinationProps {
  to?: string
  handleChangeTo: (url: string) => void
}

export function CodeDestination({
  to,
  handleChangeTo
}: CodeDestinationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [showRedirectButton, setShowRedirectButton] = useState(false)

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
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClick}
            sx={{ borderRadius: 2 }}
          >
            {showRedirectButton ? t('Cancel') : t('Change')}
          </Button>
          {showRedirectButton && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: 2 }}
            >
              {t('Redirect')}
            </Button>
          )}
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
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClick}
          sx={{ borderRadius: 2 }}
        >
          {showRedirectButton ? t('Cancel') : t('Change')}
        </Button>
        {showRedirectButton && (
          <Button
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 2 }}
          >
            {t('Redirect')}
          </Button>
        )}
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
    </Stack>
  )
}
