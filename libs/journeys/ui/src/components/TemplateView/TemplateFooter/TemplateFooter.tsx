import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { UseThisTemplateButton } from '../UseThisTemplateButton'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import { CreateJourneyButton } from '../CreateJourneyButton'
import { useJourney } from '../../../libs/JourneyProvider'
import { isJourneyCustomizable } from '../../../libs/isJourneyCustomizable'
import Skeleton from '@mui/material/Skeleton'

interface TemplateFooterProps {
  signedIn?: boolean
}

export function TemplateFooter({
  signedIn
}: TemplateFooterProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { journey } = useJourney()
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
      {journeyCustomization &&
      journey != null &&
      isJourneyCustomizable(journey) ? (
        <UseThisTemplateButton signedIn={signedIn} />
      ) : journey == null ? (
        <Skeleton
          sx={{ minWidth: 180, height: '38px', borderRadius: 3 }}
          data-testid="UseThisTemplateButtonSkeleton"
        />
      ) : (
        <CreateJourneyButton signedIn={signedIn} />
      )}
    </Stack>
  )
}
