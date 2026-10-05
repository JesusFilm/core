import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { CampaignBackgroundKind } from '../../../../__generated__/globalTypes'
import { campaignImageSource } from '../libs/campaignImageSource'
import { overlayAlpha } from '../libs/resolveBand'
import type { CampaignSectionTree } from '../types'

interface CampaignBandCoverProps {
  block: CampaignSectionTree
}

/**
 * The `image` kind's cover behind a band: the owned cover scaled to fill the
 * band (the header's own height for the chrome), under the dark overlay at
 * the `backgroundOverlay` alpha. Nothing for any other kind or an empty slot.
 */
export function CampaignBandCover({
  block
}: CampaignBandCoverProps): ReactElement | null {
  if (block.backgroundKind !== CampaignBackgroundKind.image) return null
  const cover = campaignImageSource(block.cover)
  if (cover == null) return null

  return (
    <>
      <Box
        component="img"
        src={cover.src}
        alt=""
        aria-hidden
        data-testid="CampaignBandCover"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />
      <Box
        data-testid="CampaignBandOverlay"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0, 0, 0, ${overlayAlpha(block.backgroundOverlay)})`,
          pointerEvents: 'none'
        }}
      />
    </>
  )
}
