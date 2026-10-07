import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { campaignPageHref, useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { CampaignTypography } from '../CampaignTypography'
import type { CampaignRegion, CampaignTreeOf } from '../types'

interface CampaignRegionSwitcherProps {
  block: CampaignTreeOf<'CampaignRegionSwitcherBlock'>
}

export function listedRegions(regions: CampaignRegion[]): CampaignRegion[] {
  return regions
    .filter((region) => region.listed)
    .sort((a, b) => a.order - b.order)
}

/**
 * The Region Switcher shell: the listed regions as cards that auto-fill at
 * 230 px minimum from `md` up and stack below it. Skipped by the page when
 * no region is listed; the switcher ticket fills the card variants.
 */
export function CampaignRegionSwitcher({
  block
}: CampaignRegionSwitcherProps): ReactElement {
  const { campaign, basePath } = useCampaign()
  const regions = listedRegions(campaign.regions)

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      <Box
        data-testid="CampaignRegionSwitcherGrid"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(auto-fill, minmax(230px, 1fr))'
          }
        }}
      >
        {regions.map((region) => (
          <ButtonBase
            key={region.id}
            href={campaignPageHref(`${basePath}/${region.slug}`, campaign)}
            data-testid={`CampaignRegionCard-${region.id}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 0.5,
              p: 3,
              borderRadius: 1,
              textAlign: 'left',
              backgroundColor: 'var(--campaign-band-card)',
              border: '1px solid var(--campaign-band-border)'
            }}
          >
            <Typography
              variant="h5"
              component="span"
              sx={{ color: 'var(--campaign-band-heading)' }}
            >
              {region.name}
            </Typography>
            {region.lines.map((line) =>
              line.__typename === 'CampaignTypographyBlock' ? (
                <CampaignTypography key={line.id} block={line} />
              ) : null
            )}
          </ButtonBase>
        ))}
      </Box>
    </CampaignSectionBand>
  )
}
