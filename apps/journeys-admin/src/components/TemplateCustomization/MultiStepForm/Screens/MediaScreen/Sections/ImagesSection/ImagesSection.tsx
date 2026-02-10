import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ImagesSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function ImagesSection({
  cardBlockId: _cardBlockId
}: ImagesSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="ImagesSection">
      <Typography variant="h6">{t('Images')}</Typography>
    </Box>
  )
}
