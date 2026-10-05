import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

interface CampaignHeroProps {
  block: CampaignTreeOf<'CampaignHeroBlock'>
}

/**
 * The opening section: eyebrow, title and lede aligned by `align`, over a
 * Media Slot that the media ticket fills. The slot keeps its place only when
 * the hero owns a media block.
 */
export function CampaignHero({ block }: CampaignHeroProps): ReactElement {
  return (
    <CampaignSectionBand block={block} align={block.align}>
      <CampaignSectionHeading
        eyebrow={block.eyebrow}
        title={block.title}
        lede={block.lede}
        titleVariant="h1"
        align={block.align}
      />
      {block.media != null && (
        <Box
          data-testid="CampaignHeroMedia"
          sx={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 1,
            backgroundColor: 'var(--campaign-band-card)'
          }}
        />
      )}
    </CampaignSectionBand>
  )
}
