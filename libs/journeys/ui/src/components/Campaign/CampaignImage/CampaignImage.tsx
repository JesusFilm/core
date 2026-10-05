import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { campaignImageSource } from '../libs/campaignImageSource'
import type { CampaignTreeOf } from '../types'

interface CampaignImageProps {
  block: CampaignTreeOf<'CampaignImageBlock'>
}

/**
 * The Image section: one full-width picture with its space reserved from the
 * stored width and height, so the page never shifts as it loads, and its
 * translated alt text. An empty section (no `src`) renders only its Extras;
 * the page skips it entirely when there are none.
 */
export function CampaignImage({ block }: CampaignImageProps): ReactElement {
  const image = campaignImageSource(block)
  const aspectRatio =
    image?.width != null && image.height != null && image.height > 0
      ? `${image.width} / ${image.height}`
      : undefined

  return (
    <CampaignSectionBand block={block}>
      {image != null && (
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
      )}
    </CampaignSectionBand>
  )
}
