import { createContext, useContext } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import type { ResolvedBand } from '../libs/resolveBand'

export interface CampaignSectionContextValue {
  band: ResolvedBand
  /** The section body alignment Extras inherit when their own is null. */
  align: TypographyAlign | null
}

export const CampaignSectionContext =
  createContext<CampaignSectionContextValue | null>(null)

export function useCampaignSection(): CampaignSectionContextValue | null {
  return useContext(CampaignSectionContext)
}
