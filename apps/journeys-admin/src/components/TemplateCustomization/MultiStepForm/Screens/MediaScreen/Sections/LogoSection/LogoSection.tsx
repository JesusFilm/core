import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface LogoSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function LogoSection({
  cardBlockId: _cardBlockId
}: LogoSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="LogoSection">
      <Typography variant="h6">{t('Logo')}</Typography>
    </Box>
  )
}
