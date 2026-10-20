import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import {
  CampaignImageSource,
  campaignImageSource,
  focalImageSx
} from '../libs/campaignImageSource'
import type { CampaignTreeOf } from '../types'

/** The frames a campaign picture is cropped to: a wide banner for an Image section or a stacked slot, 4:3 beside text. */
export type CampaignPictureRatio = 'wide' | 'standard'

export const CAMPAIGN_PICTURE_RATIOS: Record<CampaignPictureRatio, string> = {
  wide: '16 / 9',
  standard: '4 / 3'
}

interface CampaignPictureProps {
  image: CampaignImageSource
  /** The frame the picture fills; `wide` by default. */
  ratio?: CampaignPictureRatio
}

/**
 * One full-width picture cropped to a fixed frame (16:9, or 4:3 beside
 * text) with its focal point kept in view and any zoom applied around it, so
 * the page never shifts as it loads, and its translated alt text. The Image
 * section's body, and an image in a Media Slot. The frame clips the zoom.
 */
export function CampaignPicture({
  image,
  ratio = 'wide'
}: CampaignPictureProps): ReactElement {
  const aspectRatio = CAMPAIGN_PICTURE_RATIOS[ratio]

  return (
    <Box sx={{ overflow: 'hidden', borderRadius: 1 }}>
      <Box
        component="img"
        src={image.src}
        alt={image.alt ?? ''}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading="lazy"
        data-testid="CampaignImage"
        data-ratio={ratio}
        sx={{
          display: 'block',
          width: '100%',
          height: 'auto',
          aspectRatio,
          objectFit: 'cover',
          ...focalImageSx(image)
        }}
      />
    </Box>
  )
}

interface CampaignImageProps {
  block: CampaignTreeOf<'CampaignImageBlock'>
}

/**
 * The Image section: its picture inside the band. An empty section (no
 * `src`) renders only its Extras; the page skips it entirely when there are
 * none.
 */
export function CampaignImage({ block }: CampaignImageProps): ReactElement {
  const image = campaignImageSource(block)

  return (
    <CampaignSectionBand block={block}>
      {image != null && <CampaignPicture image={image} />}
    </CampaignSectionBand>
  )
}
