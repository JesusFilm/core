import { campaignRegionHref } from '../CampaignProvider'
import type { CampaignContextValue } from '../CampaignProvider'
import { isHttpsUrl } from '../libs/isHttpsUrl'
import type { CampaignBlockOf } from '../types'

export interface ResolvedCampaignAction {
  href: string
  target?: string
  /** Set for a same-page anchor: the id to scroll to smoothly. */
  scrollToBlockId?: string
}

/**
 * What a button links to, or null when it renders static: an https link; a
 * same-page anchor to `#<blockId>` (a target on another page is missing); a
 * relative link to a Campaign Region's page carrying the `lang` param (a
 * deleted region — `regionId` null, or no longer in the payload — is missing).
 */
export function resolveCampaignAction(
  action: CampaignBlockOf<'CampaignButtonBlock'>['action'],
  context: Pick<CampaignContextValue, 'campaign' | 'pageBlockIds'>
): ResolvedCampaignAction | null {
  if (action == null) return null
  switch (action.__typename) {
    case 'CampaignLinkAction':
      if (!isHttpsUrl(action.url)) return null
      return { href: action.url, target: action.target ?? undefined }
    case 'CampaignScrollToBlockAction':
      if (!context.pageBlockIds.has(action.blockId)) return null
      return { href: `#${action.blockId}`, scrollToBlockId: action.blockId }
    case 'CampaignNavigateToRegionAction': {
      if (action.regionId == null) return null
      const region = context.campaign.regions.find(
        (candidate) => candidate.id === action.regionId
      )
      if (region == null) return null
      return { href: campaignRegionHref(context.campaign, region.slug) }
    }
    default:
      return null
  }
}
