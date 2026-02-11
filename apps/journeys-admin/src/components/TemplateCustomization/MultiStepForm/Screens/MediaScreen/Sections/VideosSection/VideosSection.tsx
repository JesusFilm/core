import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { getCustomizableCardVideoBlock } from '../../utils'

import { VideoPreviewPlayer } from './VideoPreviewPlayer'

interface VideosSectionProps {
  cardBlockId: string | null
}

/**
 * Renders the Video section for the Media step: heading and the card's
 * customizable video preview (YouTube, Mux, or internal).
 */
export function VideosSection({
  cardBlockId
}: VideosSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const videoBlock = getCustomizableCardVideoBlock(journey, cardBlockId)

  return (
    <Box data-testid="VideosSection" width="100%">
      <Typography variant="h6">{t('Video')}</Typography>
      {videoBlock != null && <VideoPreviewPlayer videoBlock={videoBlock} />}
    </Box>
  )
}
