import { ReactElement, useMemo } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { bandCssVariables, resolveBand } from '../libs/resolveBand'
import type { CampaignSectionTree } from '../types'

import { CampaignBandCover } from './CampaignBandCover'
import type { CampaignSectionContextValue } from './CampaignSectionContext'

export interface CampaignBand {
  /** The value for `CampaignSectionContext`: the resolved band, and the alignment its Extras inherit. */
  context: CampaignSectionContextValue
  /** The band's colours as `--campaign-band-*` variables, for the band element's `style`. */
  style: Record<string, string>
  /** The `image` kind's cover and overlay, the band element's first child. */
  cover: ReactElement
}

/**
 * The Section Band of a section or chrome block: resolved from the band
 * table once per block and theme, with what its element needs to paint it.
 * `CampaignSectionBand`, `CampaignHeader` and `CampaignFooter` all paint
 * through it.
 */
export function useCampaignBand(
  block: CampaignSectionTree,
  align: TypographyAlign | null = null
): CampaignBand {
  const { campaign } = useCampaign()
  const band = useMemo(
    () => resolveBand(block, campaign.theme),
    [block, campaign.theme]
  )
  const context = useMemo(() => ({ band, align }), [band, align])
  return {
    context,
    style: bandCssVariables(band),
    cover: <CampaignBandCover block={block} />
  }
}
