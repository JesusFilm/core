import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface CardsSectionProps {
  onChange: (cardBlockId: string | null) => void
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function CardsSection({ onChange: _onChange }: CardsSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="CardsSection">
      <Typography variant="h6">{t('Cards')}</Typography>
    </Box>
  )
}
