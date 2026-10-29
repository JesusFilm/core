import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import type { CSSObject } from '@mui/material/styles'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  CampaignBackgroundKind,
  CampaignChildPlacement,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { CampaignButton } from '../CampaignButton'
import { useCampaign } from '../CampaignProvider'
import { CampaignTypography } from '../CampaignTypography'
import { bandCssVariables, resolveBand } from '../libs/resolveBand'
import { isExtra } from '../types'
import type { CampaignSectionTree, CampaignTree } from '../types'

import { CampaignBandCover } from './CampaignBandCover'
import { CAMPAIGN_HEADER_HEIGHT } from './campaignHeaderHeight'
import { CampaignSectionContext } from './CampaignSectionContext'
import { useCampaignSlot } from './CampaignSlotContext'

interface CampaignSectionBandProps {
  block: CampaignSectionTree
  /** The section body alignment; Extras with a null align follow it. */
  align?: TypographyAlign | null
  /** A minimum height as a percentage of the viewport height (the hero's `minHeight`); the body is centred in it. */
  minHeight?: number | null
  /** The section's typed body; rendered between the above and below Extras. */
  children?: ReactNode
}

/** The band's minimum height from a viewport percentage, with its body centred vertically; nothing for null or a Column Slot. */
export function minHeightSx(
  minHeight: number | null | undefined,
  inSlot: boolean
): CSSObject {
  if (minHeight == null || inSlot) return {}
  return {
    minHeight: `${minHeight}vh`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
}

/** An Extra, rendered here rather than through `CampaignRenderer`, which renders the sections that render through this band. */
function renderExtra(child: CampaignTree): ReactElement | null {
  switch (child.__typename) {
    case 'CampaignTypographyBlock':
      return <CampaignTypography key={child.id} block={child} />
    case 'CampaignButtonBlock':
      return <CampaignButton key={child.id} block={child} />
  }
  return null
}

function isAbove(child: CampaignTree): boolean {
  return isExtra(child) && child.placement === CampaignChildPlacement.above
}

/** A Column Slot paints no page rhythm, only padding when the section has a background of its own. */
function spacingFor(block: CampaignSectionTree, inSlot: boolean): CSSObject {
  if (!inSlot) return { py: { xs: 6, md: 10 } }
  if (block.backgroundKind === CampaignBackgroundKind.none) return {}
  return { p: { xs: 3, md: 4 }, borderRadius: 1 }
}

/**
 * The one wrapper every section and chrome block renders through: paints the
 * band from the §4 table as CSS variables (with the `image` cover and overlay
 * behind), anchors the band by block id under the sticky header, and orders
 * the Extras placed above, then the typed body, then the Extras placed below,
 * each group by parentOrder. In a Column Slot the band is not a container: no
 * page container or section rhythm, and a section with a background of its
 * own gets padding and a radius. The chrome paints the same band through
 * `CampaignHeader` and `CampaignFooter`.
 */
export function CampaignSectionBand({
  block,
  align = null,
  minHeight = null,
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
  // A carousel's CampaignVideoBlock items are its body's cards, not Extras.
  const below = extras.filter(
    (child) => !isAbove(child) && child.__typename !== 'CampaignVideoBlock'
  )
  const body = (
    <Stack spacing={3} sx={{ position: 'relative' }}>
      {above.map(renderExtra)}
      {children}
      {below.map(renderExtra)}
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
          position: 'relative',
          backgroundColor: 'var(--campaign-band-background)',
          color: 'var(--campaign-band-text)',
          textAlign: align ?? undefined,
          scrollMarginTop: `${CAMPAIGN_HEADER_HEIGHT}px`,
          ...spacingFor(block, inSlot),
          ...minHeightSx(minHeight, inSlot)
        }}
      >
        <CampaignBandCover block={block} />
        {inSlot ? body : <Container maxWidth="lg">{body}</Container>}
      </Box>
    </CampaignSectionContext.Provider>
  )
}
