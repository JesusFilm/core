import { ReactElement, useEffect } from 'react'

import { campaignLanguageUrl } from '@core/journeys/ui/Campaign/CampaignHeader/CampaignLanguageSelect'
import {
  CAMPAIGN_LANGUAGE_PARAM,
  campaignLanguageCookie,
  resolvePageLanguage
} from '@core/journeys/ui/Campaign/libs/resolvePageLanguage'
import type { CampaignPublic } from '@core/journeys/ui/Campaign/types'

interface CampaignLanguageRedirectProps {
  campaign: Pick<
    CampaignPublic,
    'id' | 'languageId' | 'defaultLanguageId' | 'languages'
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
 * The cookie and `Accept-Language` steps of Page Language resolution
 * (glossary).
 * The page is statically generated, so it cannot see either; a visit with no
 * `lang` param is served in the campaign default, and a visitor whose cookie
 * or browser languages name another campaign language is sent to that
 * language's page, which every link on it then carries forward. Only this
 * campaign's cookie (`campaign-lang-<campaignId>`) is read. Any `lang`
 * param stops it. An empty one is `LanguageFallbackRedirect`'s mark once the
 * visitor's language has left the campaign: a stale page still listing that
 * language must not send them back, so it stops the redirect too, and it is
 * then stripped from the address bar (no reload, other params and the hash
 * kept) so it neither looks broken nor rides along in a shared copy. This
 * runs before the one-language check, since a removed language usually
 * leaves one.
 */
export function CampaignLanguageRedirect({
  campaign
}: CampaignLanguageRedirectProps): ReactElement {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get(CAMPAIGN_LANGUAGE_PARAM) === '') {
      const url = new URL(window.location.href)
      url.searchParams.delete(CAMPAIGN_LANGUAGE_PARAM)
      window.history.replaceState(window.history.state, '', url.toString())
      return
    }
    if (campaign.languages.length < 2) return
    if (params.has(CAMPAIGN_LANGUAGE_PARAM)) return

    const resolved = resolvePageLanguage({
      languages: campaign.languages.map((candidate) => ({
        languageId: candidate.languageId,
        bcp47: candidate.language.bcp47
      })),
      defaultLanguageId: campaign.defaultLanguageId,
      cookie: readCookie(campaignLanguageCookie(campaign.id)),
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
