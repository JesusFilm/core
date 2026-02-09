import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface BackgroundVideoSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function BackgroundVideoSection({
  cardBlockId: _cardBlockId
}: BackgroundVideoSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="BackgroundVideoSection">
      <Typography variant="h6">{t('Background Video')}</Typography>
    </Box>
  )
}
