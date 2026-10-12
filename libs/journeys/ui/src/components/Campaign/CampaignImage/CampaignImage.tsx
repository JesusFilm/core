import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { campaignImageSource } from '../libs/campaignImageSource'
import type { CampaignImageSource } from '../libs/campaignImageSource'
import type { CampaignTreeOf } from '../types'

interface CampaignPictureProps {
  image: CampaignImageSource
}

/**
 * One full-width picture with its space reserved from the stored width and
 * height, so the page never shifts as it loads, and its translated alt text.
 * The Image section's body, and an image in a Media Slot.
 */
export function CampaignPicture({ image }: CampaignPictureProps): ReactElement {
  const aspectRatio =
    image.width != null && image.height != null && image.height > 0
      ? `${image.width} / ${image.height}`
      : undefined

  return (
    <Box
      component="img"
      src={image.src}
      alt={image.alt ?? ''}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading="lazy"
      data-testid="CampaignImage"
      sx={{
        display: 'block',
        width: '100%',
        height: 'auto',
        aspectRatio,
        objectFit: 'cover',
        borderRadius: 1
      }}
    />
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
