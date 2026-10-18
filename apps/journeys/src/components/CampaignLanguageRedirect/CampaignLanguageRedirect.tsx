import { ReactElement, useEffect } from 'react'

import {
  CAMPAIGN_LANGUAGE_COOKIE,
  CAMPAIGN_LANGUAGE_PARAM,
  campaignLanguageUrl,
  resolvePageLanguage
} from '@core/journeys/ui/Campaign'
import type { CampaignPublic } from '@core/journeys/ui/Campaign'

interface CampaignLanguageRedirectProps {
  campaign: Pick<
    CampaignPublic,
    'languageId' | 'defaultLanguageId' | 'languages'
  >
}

function readCookie(name: string): string | null {
  const entry = document.cookie
    .split('; ')
    .find((candidate) => candidate.startsWith(`${name}=`))
  if (entry == null) return null
  return decodeURIComponent(entry.slice(name.length + 1))
}

/**
 * The cookie and `Accept-Language` steps of the Page Language order (PRD §2).
 * The page is statically generated, so it cannot see either; a visit with no
 * `lang` param is served in the campaign default, and a visitor whose cookie
 * or browser languages name another campaign language is sent to that
 * language's page, which every link on it then carries forward.
 */
export function CampaignLanguageRedirect({
  campaign
}: CampaignLanguageRedirectProps): ReactElement {
  useEffect(() => {
    if (campaign.languages.length < 2) return
    const params = new URLSearchParams(window.location.search)
    if (params.has(CAMPAIGN_LANGUAGE_PARAM)) return

    const resolved = resolvePageLanguage({
      languages: campaign.languages.map((candidate) => ({
        languageId: candidate.languageId,
        bcp47: candidate.language.bcp47
      })),
      defaultLanguageId: campaign.defaultLanguageId,
      cookie: readCookie(CAMPAIGN_LANGUAGE_COOKIE),
      acceptLanguage: navigator.languages.join(',')
    })
    if (resolved.languageId === campaign.languageId || resolved.bcp47 == null)
      return
    window.location.replace(
      campaignLanguageUrl(window.location.href, resolved.bcp47)
    )
  }, [campaign])

  return <></>
}
