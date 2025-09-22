import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { UseThisTemplateButton } from '../UseThisTemplateButton'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import { CreateJourneyButton } from '../CreateJourneyButton'

interface TemplateFooterProps {
  signedIn?: boolean
}

export function TemplateFooter({
  signedIn
}: TemplateFooterProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { journeyCustomization } = useFlags()

  return (
    <Stack
      alignItems="center"
      gap={6}
      sx={{ py: 9 }}
      data-testid="TemplateFooter"
    >
      <Typography
        variant="subtitle1"
        align="center"
        sx={{
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {t('Use this template to make it your journey')}
      </Typography>
      <Typography
        variant="subtitle2"
        align="center"
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        {t('Use this template to make it your journey')}
      </Typography>
      { journeyCustomization ? <UseThisTemplateButton signedIn={signedIn} /> : <CreateJourneyButton signedIn={signedIn} />}
    </Stack>
  )
}
