import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { DescriptionEdit } from '../../../../Editor/Slider/Settings/SocialDetails/DescriptionEdit'
import { TitleEdit } from '../../../../Editor/Slider/Settings/SocialDetails/TitleEdit'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import { SocialScreenSocialImage } from './SocialScreenSocialImage'

interface SocialScreenProps {
  handleNext: (overrideJourneyId?: string) => void
  handleScreenNavigation: (screen: CustomizationScreen) => void
}

export function SocialScreen({
  handleNext,
  handleScreenNavigation
}: SocialScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      alignItems="center"
      sx={{
        px: { xs: 5, sm: 20 }
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        display={{ xs: 'none', sm: 'block' }}
      >
        {t('Final Details')}
      </Typography>
      <Typography
        variant="h6"
        gutterBottom
        display={{ xs: 'block', sm: 'none' }}
      >
        {t('Final Details')}
      </Typography>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        align="center"
        sx={{
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {t('Customize how your invite appears when shared on social media.')}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        display={{ xs: 'block', sm: 'none' }}
      >
        {t('This is how your content will appear when shared on social media.')}
      </Typography>
      <Stack
        alignItems="center"
        gap={6}
        data-testid="SocialShareAppearance"
        sx={{
          width: '100%',
          py: 5
        }}
      >
        <SocialScreenSocialImage />
        <TitleEdit />
        <DescriptionEdit />
      </Stack>
      <CustomizeFlowNextButton
        label={t('Done')}
        onClick={() => handleNext()}
        ariaLabel={t('Done')}
      />
    </Stack>
  )
}
