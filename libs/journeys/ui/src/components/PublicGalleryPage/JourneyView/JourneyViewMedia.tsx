import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { StrategySection } from '../../StrategySection'

interface JourneyViewMediaProps {
  mediaUrl?: string | null
}

export function JourneyViewMedia({
  mediaUrl
}: JourneyViewMediaProps): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  if (mediaUrl == null || mediaUrl === '') return null

  return (
    <Stack spacing={2} data-testid="TemplateGalleryMedia">
      <Typography variant="h5">{t('Strategy')}</Typography>
      <StrategySection strategySlug={mediaUrl} variant="placeholder" />
    </Stack>
  )
}
