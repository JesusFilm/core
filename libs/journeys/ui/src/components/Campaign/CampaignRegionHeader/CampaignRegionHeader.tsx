import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignTypography } from '../CampaignTypography'
import { hasText } from '../types'
import type { CampaignTreeOf } from '../types'

interface CampaignRegionHeaderProps {
  block: CampaignTreeOf<'CampaignRegionHeaderBlock'>
}

/**
 * Region Page only: the rendered region's name, its Region Lines and the
 * intro. Renders nothing without a region.
 */
export function CampaignRegionHeader({
  block
}: CampaignRegionHeaderProps): ReactElement | null {
  const { region } = useCampaign()
  if (region == null) return null

  return (
    <CampaignSectionBand block={block}>
      <Typography
        variant="h1"
        data-testid="CampaignRegionName"
        sx={{ color: 'var(--campaign-band-heading)' }}
      >
        {region.name}
      </Typography>
      {region.lines.map((line) =>
        line.__typename === 'CampaignTypographyBlock' ? (
          <CampaignTypography key={line.id} block={line} />
        ) : null
      )}
      {hasText(block.intro) && (
        <Typography
          variant="body1"
          data-testid="CampaignRegionIntro"
          sx={{ color: 'var(--campaign-band-muted)', maxWidth: 720 }}
        >
          {block.intro}
        </Typography>
      )}
    </CampaignSectionBand>
  )
}
