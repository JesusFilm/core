import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { getCustomizableCardVideoBlock } from '../../utils'

interface VideosSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function VideosSection({
  cardBlockId
}: VideosSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const videoBlock = getCustomizableCardVideoBlock(journey, cardBlockId)

  return (
    <Box data-testid="VideosSection">
      <Typography variant="h6">{t('Video')}</Typography>
      {videoBlock != null && (
        <Typography variant="body2">{videoBlock.id}</Typography>
      )}
    </Box>
  )
}
