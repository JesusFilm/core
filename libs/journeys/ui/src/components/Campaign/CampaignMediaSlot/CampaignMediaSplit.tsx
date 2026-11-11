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
  /** One column at every width: the text, then the media full width. */
  stacked?: boolean
  /** Load the media at once with high priority (the Hero's); lazy by default. */
  eager?: boolean
}

/**
 * A section body with its Media Slot beside its text: two columns from `md`
 * up with the media on `mediaSide`, a single column below it in the same
 * order. `stacked` keeps the single column at every width, the text then the
 * media. An empty slot leaves the text full width; empty text leaves the
 * media alone.
 */
export function CampaignMediaSplit({
  text,
  media,
  mediaSide = CampaignMediaSide.right,
  stacked = false,
  eager = false
}: CampaignMediaSplitProps): ReactElement | null {
  if (!hasCampaignMedia(media)) return <>{text}</>

  const mediaColumn = (
    <Box data-testid="CampaignMediaSlot" sx={{ minWidth: 0 }}>
      <CampaignMediaSlot media={media} stacked={stacked} eager={eager} />
    </Box>
  )
  if (text == null) return mediaColumn

  const textColumn = <Box sx={{ minWidth: 0 }}>{text}</Box>
  const mediaLeft = !stacked && mediaSide === CampaignMediaSide.left
  return (
    <Box
      data-testid="CampaignMediaSplit"
      data-media-side={stacked ? undefined : mediaSide}
      data-stacked={stacked || undefined}
      sx={{
        display: 'grid',
        gap: { xs: 4, md: 6 },
        alignItems: 'center',
        gridTemplateColumns: stacked ? '1fr' : { xs: '1fr', md: '1fr 1fr' }
      }}
    >
      {mediaLeft ? mediaColumn : textColumn}
      {mediaLeft ? textColumn : mediaColumn}
    </Box>
  )
}
