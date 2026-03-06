import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { DescriptionEdit } from '../../../../Editor/Slider/Settings/SocialDetails/DescriptionEdit'
import { TitleEdit } from '../../../../Editor/Slider/Settings/SocialDetails/TitleEdit'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { ScreenWrapper } from '../ScreenWrapper'

import { SocialScreenSocialImage } from './SocialScreenSocialImage'

interface SocialScreenProps {
  handleNext: (overrideJourneyId?: string) => void
}

export function SocialScreen({
  handleNext,
}: SocialScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
      <ScreenWrapper
        title={t('Social Media')}
        subtitle={t(
          'This is how your content will look on social media.'
        )}
        footer={
          <CustomizeFlowNextButton
            label={t('Done')}
            onClick={() => handleNext()}
            ariaLabel={t('Done')}
          />
        }
      >
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
      </ScreenWrapper>
  )
}
