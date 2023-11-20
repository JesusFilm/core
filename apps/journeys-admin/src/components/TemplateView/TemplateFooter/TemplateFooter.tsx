import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Stack
      alignItems="center"
      gap={6}
      sx={{ py: 9 }}
      data-testid="TemplateFooter"
    >
      <Typography variant={smUp ? 'subtitle1' : 'subtitle2'} align="center">
        {t('Use this template to make it your journey')}
      </Typography>
      <CreateJourneyButton signedIn={signedIn} />
    </Stack>
  )
}
