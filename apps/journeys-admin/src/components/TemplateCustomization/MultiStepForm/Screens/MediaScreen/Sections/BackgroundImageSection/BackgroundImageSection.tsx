import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface BackgroundImageSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function BackgroundImageSection({
  cardBlockId: _cardBlockId
}: BackgroundImageSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="BackgroundImageSection">
      <Typography variant="h6">{t('Background Image')}</Typography>
    </Box>
  )
}
