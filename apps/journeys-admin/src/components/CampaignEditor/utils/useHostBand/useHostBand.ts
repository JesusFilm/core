import { useMemo } from 'react'

import { resolveBand } from '@core/journeys/ui/Campaign'

import { isCampaignStyledBlock } from '../../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'

type ResolvedBand = ReturnType<typeof resolveBand>

/**
 * The band of the section hosting the selection: the colours an Extra
 * inherits while its own are null. Undefined when the selection has no
 * styled host (a Region Line), where the theme applies.
 */
export function useHostBand(): ResolvedBand | undefined {
  const { campaign, selection } = useCampaignEditor()
  const { host } = selection
  return useMemo(
    () =>
      host != null && isCampaignStyledBlock(host)
        ? resolveBand(host, campaign.theme)
        : undefined,
    [host, campaign.theme]
  )
}
