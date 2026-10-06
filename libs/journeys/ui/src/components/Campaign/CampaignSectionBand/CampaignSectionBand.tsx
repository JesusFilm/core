import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignBackgroundKind,
  CampaignChildPlacement,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { CampaignRenderer } from '../CampaignRenderer'
import { bandCssVariables, resolveBand } from '../libs/resolveBand'
import type { CampaignSectionTree, CampaignTree } from '../types'

import { CampaignSectionContext } from './CampaignSectionContext'
import { useCampaignSlot } from './CampaignSlotContext'

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
 * below, each group by parentOrder. In a Column Slot the band is not a
 * container: no page container or section rhythm, and a section with a
 * background of its own gets padding and a radius.
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
  const inSlot = useCampaignSlot()
  const extras = block.children.filter(
    (child) => child.__typename !== 'CampaignColumnBlock'
  )
  const above = extras.filter(isAbove)
  const below = extras.filter((child) => !isAbove(child))
  const body = (
    <Stack spacing={3}>
      {above.map((child) => (
        <CampaignRenderer key={child.id} block={child} />
      ))}
      {children}
      {below.map((child) => (
        <CampaignRenderer key={child.id} block={child} />
      ))}
    </Stack>
  )

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
          ...(inSlot
            ? block.backgroundKind !== CampaignBackgroundKind.none
              ? { p: { xs: 3, md: 4 }, borderRadius: 1 }
              : {}
            : { py: { xs: 6, md: 10 } })
        }}
      >
        {inSlot ? body : <Container maxWidth="lg">{body}</Container>}
      </Box>
    </CampaignSectionContext.Provider>
  )
}
