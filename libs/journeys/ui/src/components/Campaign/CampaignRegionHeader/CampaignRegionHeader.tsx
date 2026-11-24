import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import { CampaignMutedText } from '../CampaignMutedText'
import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignTypography } from '../CampaignTypography'
import { hasText } from '../types'
import type { CampaignRegion, CampaignTreeOf } from '../types'

interface CampaignRegionHeaderProps {
  block: CampaignTreeOf<'CampaignRegionHeaderBlock'>
}

/** The region's name as the Region Header sets it: the page's heading in the band. */
export function CampaignRegionName({
  children
}: {
  children: ReactNode
}): ReactElement {
  return (
    <Typography
      variant="h1"
      data-testid="CampaignRegionName"
      sx={{ color: 'var(--campaign-band-heading)' }}
    >
      {children}
    </Typography>
  )
}

/** A region's Region Lines as text, in order: its Typography lines; any other block is left out. */
export function regionLineTexts(
  lines: CampaignRegion['lines']
): ReactElement[] {
  return lines.flatMap((line) =>
    line.__typename === 'CampaignTypographyBlock'
      ? [<CampaignTypography key={line.id} block={line} />]
      : []
  )
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
      <CampaignRegionName>{region.name}</CampaignRegionName>
      {regionLineTexts(region.lines)}
      {hasText(block.intro) && (
        <CampaignMutedText data-testid="CampaignRegionIntro">
          {block.intro}
        </CampaignMutedText>
      )}
    </CampaignSectionBand>
  )
}
