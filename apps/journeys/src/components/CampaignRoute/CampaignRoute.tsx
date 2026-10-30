import { ReactElement } from 'react'

import type { CampaignRouteResult } from '../../libs/resolveCampaignPage'
import { CampaignPageWrapper } from '../CampaignPageWrapper'
import { LanguageFallbackRedirect } from '../LanguageFallbackRedirect'

/**
 * The one renderer of a resolved campaign route: the Campaign Page, or the
 * browser's move to the plain page for a tag the campaign does not offer.
 * Its props are the resolution itself, as static props carry it.
 */
export function CampaignRoute(result: CampaignRouteResult): ReactElement {
  if (result.kind === 'languageFallback')
    return (
      <LanguageFallbackRedirect
        destination={result.destination}
        campaignId={result.campaignId}
      />
    )
  return (
    <CampaignPageWrapper
      campaign={result.campaign}
      pageKind={result.pageKind}
      region={result.region}
    />
  )
}
