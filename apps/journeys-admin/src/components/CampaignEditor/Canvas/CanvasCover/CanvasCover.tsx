import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import {
  campaignImageSource,
  focalImageSx,
  overlayAlpha
} from '@core/journeys/ui/Campaign'

import { CampaignBackgroundKind } from '../../../../../__generated__/globalTypes'
import type { CanvasBlock } from '../canvasBlock'

interface CanvasCoverProps {
  /** The section whose background image this is. */
  block: CanvasBlock
}

/** A section's background image under its overlay, as the public page lays them; nothing unless the background is an image. */
export function CanvasCover({ block }: CanvasCoverProps): ReactElement | null {
  const styled = 'backgroundKind' in block ? block : null
  const cover =
    styled?.backgroundKind === CampaignBackgroundKind.image
      ? campaignImageSource(block.cover)
      : null
  if (cover == null) return null

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 'inherit',
          pointerEvents: 'none'
        }}
      >
        <Box
          component="img"
          src={cover.src}
          alt=""
          aria-hidden
          data-testid="CanvasSectionCover"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...focalImageSx(cover)
          }}
        />
      </Box>
      <Box
        data-testid="CanvasSectionOverlay"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0, 0, 0, ${overlayAlpha(styled?.backgroundOverlay)})`,
          pointerEvents: 'none'
        }}
      />
    </>
  )
}
