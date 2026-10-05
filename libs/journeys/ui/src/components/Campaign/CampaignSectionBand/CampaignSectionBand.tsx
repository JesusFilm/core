import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignChildPlacement,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { CampaignRenderer } from '../CampaignRenderer'
import { bandCssVariables, resolveBand } from '../libs/resolveBand'
import type { CampaignSectionTree, CampaignTree } from '../types'

import { CampaignBandCover } from './CampaignBandCover'
import { CampaignSectionContext } from './CampaignSectionContext'
import { CAMPAIGN_HEADER_HEIGHT } from './campaignHeaderHeight'

interface CampaignSectionBandProps {
  block: CampaignSectionTree
  /** The section body alignment; Extras with a null align follow it. */
  align?: TypographyAlign | null
  /** The section's typed body; rendered between the above and below Extras. */
  children?: ReactNode
}

function isAbove(child: CampaignTree): boolean {
  return (
    (child.__typename === 'CampaignTypographyBlock' ||
      child.__typename === 'CampaignButtonBlock') &&
    child.placement === CampaignChildPlacement.above
  )
}

/**
 * The one wrapper every section renders through: paints the band from the
 * §4 table as CSS variables (with the `image` cover and overlay behind),
 * anchors the band by block id under the sticky header, and orders the
 * Extras placed above, then the typed body, then the Extras placed below,
 * each group by parentOrder. The chrome paints the same band through
 * `CampaignHeader` and `CampaignFooter`.
 */
export function CampaignSectionBand({
  block,
  align = null,
  children
}: CampaignSectionBandProps): ReactElement {
  const { campaign } = useCampaign()
  const band = useMemo(
    () => resolveBand(block, campaign.theme),
    [block, campaign.theme]
  )
  const above = block.children.filter(isAbove)
  const below = block.children.filter((child) => !isAbove(child))

  return (
    <CampaignSectionContext.Provider value={{ band, align }}>
      <Box
        component="section"
        id={block.id}
        data-testid={`CampaignSectionBand-${block.id}`}
        style={bandCssVariables(band)}
        sx={{
          position: 'relative',
          backgroundColor: 'var(--campaign-band-background)',
          color: 'var(--campaign-band-text)',
          textAlign: align ?? undefined,
          scrollMarginTop: `${CAMPAIGN_HEADER_HEIGHT}px`,
          py: { xs: 6, md: 10 }
        }}
      >
        <CampaignBandCover block={block} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack spacing={3}>
            {above.map((child) => (
              <CampaignRenderer key={child.id} block={child} />
            ))}
            {children}
            {below.map((child) => (
              <CampaignRenderer key={child.id} block={child} />
            ))}
          </Stack>
        </Container>
      </Box>
    </CampaignSectionContext.Provider>
  )
}
