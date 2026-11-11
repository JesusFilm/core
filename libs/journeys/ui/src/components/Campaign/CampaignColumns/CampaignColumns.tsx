import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { CampaignColumnsRatio } from '../../../../__generated__/globalTypes'
import {
  CampaignSectionBand,
  CampaignSlotContext
} from '../CampaignSectionBand'
import type { CampaignTree, CampaignTreeOf } from '../types'

interface CampaignColumnsProps {
  block: CampaignTreeOf<'CampaignColumnsBlock'>
  /** A Column Slot's section, or null when the slot renders none: passed in by the section registry, so Columns imports neither the renderer nor the render gates. */
  renderSlot: (slot: CampaignTree) => ReactElement | null
}

const RATIO_COLUMNS: Record<CampaignColumnsRatio, string> = {
  [CampaignColumnsRatio.equal]: 'minmax(0, 1fr) minmax(0, 1fr)',
  [CampaignColumnsRatio.wideLeft]: 'minmax(0, 2fr) minmax(0, 1fr)',
  [CampaignColumnsRatio.wideRight]: 'minmax(0, 1fr) minmax(0, 2fr)'
}

/** The CSS grid columns of a Columns section at `md` and up. */
export function columnsGridTemplate(ratio: CampaignColumnsRatio): string {
  return RATIO_COLUMNS[ratio]
}

/**
 * Two Column Slots in the authored ratio from `md` up and a single stacked
 * column below it. An empty slot is empty space beside its neighbour at `md`
 * and up and collapses when stacked. Slots are not containers: the section
 * inside breaks with the page, not with the slot.
 */
export function CampaignColumns({
  block,
  renderSlot
}: CampaignColumnsProps): ReactElement {
  const slots = block.children.filter(
    (child) => child.__typename === 'CampaignColumnBlock'
  )

  return (
    <CampaignSectionBand block={block}>
      <Box
        data-testid="CampaignColumns"
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: RATIO_COLUMNS[block.ratio]
          }
        }}
      >
        {slots.map((slot) => {
          const section = renderSlot(slot)
          return (
            <Box
              key={slot.id}
              data-testid={`CampaignColumnSlot-${slot.id}`}
              sx={
                section == null ? { display: { xs: 'none', md: 'block' } } : {}
              }
            >
              {section != null && (
                <CampaignSlotContext.Provider value>
                  {section}
                </CampaignSlotContext.Provider>
              )}
            </Box>
          )
        })}
      </Box>
    </CampaignSectionBand>
  )
}
