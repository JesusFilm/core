import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { CreateJourneyButton } from '../CreateJourneyButton'

interface TemplateFooterProps {
  signedIn?: boolean
}

export function TemplateFooter({
  signedIn
}: TemplateFooterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack alignItems="center" gap={6} sx={{ py: 9 }}>
      <Typography variant="subtitle1" align="center">
        {t('Use this template to make it your journey')}
      </Typography>
      <CreateJourneyButton signedIn={signedIn} />
    </Stack>
  )
}
