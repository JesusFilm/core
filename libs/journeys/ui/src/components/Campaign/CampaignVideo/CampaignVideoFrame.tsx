import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

import type { StyleObject } from '../libs/campaignSx'

interface CampaignVideoFrameProps {
  /** A poster URL drawn lazily to fill the frame. */
  poster?: string | null
  sx?: StyleObject
  /** Drawn over the frame: a badge, or the poster picture and player. */
  children?: ReactNode
}

/**
 * The 16:9 frame a video shows in: a poster card's and a carousel card's,
 * with their poster, and the inline player's, whose poster and player come
 * in as children. Empty, it shows the band's border colour.
 */
export function CampaignVideoFrame({
  poster,
  sx,
  children
}: CampaignVideoFrameProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '16 / 9',
        backgroundColor: 'var(--campaign-band-border)',
        ...sx
      }}
    >
      {poster != null && (
        <Box
          component="img"
          src={poster}
          alt=""
          loading="lazy"
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
      {children}
    </Box>
  )
}
