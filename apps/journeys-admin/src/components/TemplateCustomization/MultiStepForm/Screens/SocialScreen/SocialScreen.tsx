import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import Box from '@mui/material/Box'
import { ImageEdit } from '../../../../Editor/Slider/Settings/Drawer/ImageEdit'
import { TitleEdit } from '../../../../Editor/Slider/Settings/SocialDetails/TitleEdit'
import { DescriptionEdit } from '../../../../Editor/Slider/Settings/SocialDetails/DescriptionEdit'
import { CustomizationScreens } from '../../MultiStepForm'

interface SocialScreenProps {
  handleNext: () => void
  handleScreenNavigation: (screen: CustomizationScreens) => void
}

const BUTTON_NEXT_STEP_WIDTH = '150px'
const BUTTON_NEXT_STEP_HEIGHT = '42px'

export function SocialScreen({ 
  handleNext, 
  handleScreenNavigation 
}: SocialScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      alignItems="center"
      gap={0}
      sx={{
        px: { xs: 5, sm: 20 }
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
      >
        {t('Almost There!')}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{
          typography: { xs: 'body2', sm: 'h6' }
        }}
      >
        {t('Here’s how your invitation will appear when shared on social media. You can update it if you’d like.')}
      </Typography>
      <Box
        data-testid="SocialShareAppearance"
        sx={{
          py: 5,
          px: { xs: 5, sm: 10 },
          width: '100%'
        }}>
        <TitleEdit />
        <DescriptionEdit />
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleNext}
        endIcon={<ArrowRightIcon />}
        data-testid="DoneButton"
        sx={{
          width: BUTTON_NEXT_STEP_WIDTH,
          height: BUTTON_NEXT_STEP_HEIGHT,
          alignSelf: 'center',
          mt: -4,
          borderRadius: '8px'
        }}
      >
        {t('Done')}
      </Button>
    </Stack>
  )
}