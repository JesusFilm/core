import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignTreeOf } from '../types'

interface CampaignRegionShareProps {
  block: CampaignTreeOf<'CampaignRegionShareBlock'>
}

/**
 * The Region Share shell: title and intro only, which is also what the full
 * section shows when no Share Language has a journey. The share ticket adds
 * the language selector, phone frame, link and QR code.
 */
export function CampaignRegionShare({
  block
}: CampaignRegionShareProps): ReactElement {
  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      {hasText(block.intro) && (
        <Typography
          variant="body1"
          data-testid="CampaignRegionShareIntro"
          sx={{ color: 'var(--campaign-band-muted)', maxWidth: 720 }}
        >
          {block.intro}
        </Typography>
      )}
    </CampaignSectionBand>
  )
}
