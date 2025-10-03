import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TitleEdit } from '../../../../Editor/Slider/Settings/SocialDetails/TitleEdit'
import { DescriptionEdit } from '../../../../Editor/Slider/Settings/SocialDetails/DescriptionEdit'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { SocialScreenSocialImage } from './SocialScreenSocialImage'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

interface SocialScreenProps {
  handleNext: () => void
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
        {t('Almost There!')}
      </Typography>
      <Typography
        variant="h6"
        gutterBottom
        display={{ xs: 'block', sm: 'none' }}
      >
        {t('Almost There!')}
      </Typography>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        align="center"
        sx={{
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {t(
          'Here’s how your invitation will appear when shared on social media. You can update it if you’d like.'
        )}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        display={{ xs: 'block', sm: 'none' }}
      >
        {t(
          'Here’s how your invitation will appear when shared on social media. You can update it if you’d like.'
        )}
      </Typography>
      <Stack
        alignItems="center"
        gap={6}
        data-testid="SocialShareAppearance"
        sx={{
          width: '100%',
          py: 5,
          px: { xs: 5, sm: 10 }
        }}
      >
        <SocialScreenSocialImage />
        <TitleEdit />
        <DescriptionEdit />
      </Stack>
      <CustomizeFlowNextButton
        label={t('Done')}
        onClick={handleNext}
        ariaLabel={t('Done')}
      />
    </Stack>
  )
}
