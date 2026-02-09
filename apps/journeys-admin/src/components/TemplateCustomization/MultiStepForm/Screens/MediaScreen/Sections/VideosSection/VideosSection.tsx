import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface VideosSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function VideosSection({ cardBlockId: _cardBlockId }: VideosSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="VideosSection">
      <Typography variant="h6">{t('Video')}</Typography>
    </Box>
  )
}
