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

import { CampaignSectionContext } from './CampaignSectionContext'

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
 * The one wrapper every section and chrome block renders through: paints the
 * band from the §4 table as CSS variables, anchors the band by block id, and
 * orders the Extras placed above, then the typed body, then the Extras placed
 * below, each group by parentOrder.
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
          backgroundColor: 'var(--campaign-band-background)',
          color: 'var(--campaign-band-text)',
          textAlign: align ?? undefined,
          scrollMarginTop: 'var(--campaign-header-height, 64px)',
          py: { xs: 6, md: 10 }
        }}
      >
        <Container maxWidth="lg">
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
