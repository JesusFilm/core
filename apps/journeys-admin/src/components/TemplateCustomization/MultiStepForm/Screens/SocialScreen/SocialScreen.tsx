import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

interface SocialScreenProps {
  handleNext: () => void
}

export function SocialScreen({ handleNext }: SocialScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('Social Media Integration')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('Set up social media sharing and integration options.')}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleNext}
        sx={{ width: '300px', alignSelf: 'center', mt: 4 }}
      >
        <ArrowRightIcon />
      </Button>
    </Stack>
  )
}
