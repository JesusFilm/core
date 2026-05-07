import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { StrategySection } from '@core/journeys/ui/StrategySection'

interface TemplateGalleryMediaProps {
  mediaUrl: string | null
}

export function TemplateGalleryMedia({
  mediaUrl
}: TemplateGalleryMediaProps): ReactElement | null {
  if (mediaUrl == null || mediaUrl === '') return null

  return (
    <Box data-testid="TemplateGalleryMedia">
      <StrategySection strategySlug={mediaUrl} variant="full" />
    </Box>
  )
}
