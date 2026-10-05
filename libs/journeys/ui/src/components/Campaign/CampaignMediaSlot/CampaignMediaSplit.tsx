import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

import { CampaignMediaSide } from '../../../../__generated__/globalTypes'
import type { CampaignTree } from '../types'

import { CampaignMediaSlot, hasCampaignMedia } from './CampaignMediaSlot'

interface CampaignMediaSplitProps {
  /** The section's text column; null when every text field is empty. */
  text: ReactNode | null
  media: CampaignTree | null
  mediaSide?: CampaignMediaSide
}

/**
 * A section body with its Media Slot beside its text: two columns from `md`
 * up with the media on `mediaSide`, a single column below it in the same
 * order. An empty slot leaves the text full width; empty text leaves the
 * media alone.
 */
export function CampaignMediaSplit({
  text,
  media,
  mediaSide = CampaignMediaSide.right
}: CampaignMediaSplitProps): ReactElement | null {
  if (!hasCampaignMedia(media)) return <>{text}</>

  const mediaColumn = (
    <Box data-testid="CampaignMediaSlot" sx={{ minWidth: 0 }}>
      <CampaignMediaSlot media={media} />
    </Box>
  )
  if (text == null) return mediaColumn

  const textColumn = <Box sx={{ minWidth: 0 }}>{text}</Box>
  return (
    <Box
      data-testid="CampaignMediaSplit"
      data-media-side={mediaSide}
      sx={{
        display: 'grid',
        gap: { xs: 4, md: 6 },
        alignItems: 'center',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
      }}
    >
      {mediaSide === CampaignMediaSide.left ? mediaColumn : textColumn}
      {mediaSide === CampaignMediaSide.left ? textColumn : mediaColumn}
    </Box>
  )
}
