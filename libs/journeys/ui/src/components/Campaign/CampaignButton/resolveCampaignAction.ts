import type { CampaignContextValue } from '../CampaignProvider'
import type { CampaignBlockOf } from '../types'

export interface ResolvedCampaignAction {
  href: string
  target?: string
  /** Set for a same-page anchor: the id to scroll to smoothly. */
  scrollToBlockId?: string
}

/**
 * What a button links to, or null when it renders static: a web link; a
 * same-page anchor to `#<blockId>` (a target on another page is missing); a
 * relative link to a Campaign Region's page (a deleted region is missing).
 */
export function resolveCampaignAction(
  action: CampaignBlockOf<'CampaignButtonBlock'>['action'],
  context: Pick<CampaignContextValue, 'campaign' | 'basePath' | 'pageBlockIds'>
): ResolvedCampaignAction | null {
  if (action == null) return null
  switch (action.__typename) {
    case 'CampaignLinkAction':
      return { href: action.url, target: action.target ?? undefined }
    case 'CampaignScrollToBlockAction':
      if (!context.pageBlockIds.has(action.blockId)) return null
      return { href: `#${action.blockId}`, scrollToBlockId: action.blockId }
    case 'CampaignNavigateToRegionAction': {
      const region = context.campaign.regions.find(
        (candidate) => candidate.id === action.regionId
      )
      if (region == null) return null
      return { href: `${context.basePath}/${region.slug}` }
    }
    default:
      return null
  }
}
