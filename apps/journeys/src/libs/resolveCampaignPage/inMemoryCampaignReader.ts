import type { CampaignPublic } from '@core/journeys/ui/Campaign/types'

import type { CampaignReader, CampaignTarget } from './resolveCampaignPage'

interface InMemoryCampaign {
  /** Where the campaign is read: its slug, or its Campaign Domain. */
  target: CampaignTarget
  /** The read in the campaign default (no `languageId`). */
  inDefault: CampaignPublic
  /** The read in each other language, by `languageId`; a language missing here reads `inDefault`. */
  inLanguage?: Record<string, CampaignPublic>
}

function sameTarget(a: CampaignTarget, b: CampaignTarget): boolean {
  if ('slug' in a) return 'slug' in b && a.slug === b.slug
  return 'hostname' in b && a.hostname === b.hostname
}

/**
 * A spec helper: a `CampaignReader` over published campaigns held in
 * memory. Any other target reads null, as a draft or unknown one does.
 */
export function inMemoryCampaignReader(
  campaigns: InMemoryCampaign[]
): CampaignReader {
  return (target, languageId) => {
    const stored = campaigns.find((candidate) =>
      sameTarget(candidate.target, target)
    )
    if (stored == null) return Promise.resolve(null)
    if (languageId == null) return Promise.resolve(stored.inDefault)
    return Promise.resolve(stored.inLanguage?.[languageId] ?? stored.inDefault)
  }
}
