import FilledInput from '@mui/material/FilledInput'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { CodeDestinationPopper } from './CodeDestinationPopper'

interface CodeDestinationProps {
  to?: string
}

export function CodeDestination({ to }: CodeDestinationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

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
      </Stack>
      <FilledInput fullWidth hiddenLabel value={to} disabled />
    </Stack>
  )
}
