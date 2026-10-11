import { ApolloCache, Reference } from '@apollo/client'

export type CampaignRegionRef = {
  __typename: string
  id: string
}

/**
 * The editor keeps every region in `Campaign.regions` (the list the
 * `campaign` query returns, sorted by `order` when rendered). Create and
 * delete adjust that list so the switcher re-renders without a refetch;
 * the rows themselves are normalised from mutation results and optimistic
 * responses, so update and reorder need no list work.
 */

function campaignCacheId(
  cache: ApolloCache,
  campaignId: string
): string | undefined {
  return cache.identify({ __typename: 'Campaign', id: campaignId })
}

/** Append a region to `Campaign.regions` unless already listed. */
export function campaignRegionsAdd(
  cache: ApolloCache,
  campaignId: string,
  region: CampaignRegionRef
): void {
  cache.modify({
    id: campaignCacheId(cache, campaignId),
    fields: {
      regions(existing: readonly Reference[] = [], { toReference }) {
        const ref = toReference(region)
        if (
          ref == null ||
          existing.some((candidate) => candidate.__ref === ref.__ref)
        )
          return existing
        return [...existing, ref]
      }
    }
  })
}

/** Drop a region from `Campaign.regions` and evict its row. */
export function campaignRegionsRemove(
  cache: ApolloCache,
  campaignId: string,
  regionId: string
): void {
  cache.modify({
    id: campaignCacheId(cache, campaignId),
    fields: {
      regions(existing: readonly Reference[] = [], { readField }) {
        return existing.filter(
          (candidate) => readField('id', candidate) !== regionId
        )
      }
    }
  })
  cache.evict({
    id: cache.identify({ __typename: 'CampaignRegion', id: regionId })
  })
  cache.gc()
}

/** Append a country chip to `CampaignRegion.countries` unless already listed. */
export function campaignRegionCountriesAdd(
  cache: ApolloCache,
  regionId: string,
  country: CampaignRegionRef
): void {
  cache.modify({
    id: cache.identify({ __typename: 'CampaignRegion', id: regionId }),
    fields: {
      countries(existing: readonly Reference[] = [], { toReference }) {
        const ref = toReference(country)
        if (
          ref == null ||
          existing.some((candidate) => candidate.__ref === ref.__ref)
        )
          return existing
        return [...existing, ref]
      }
    }
  })
}

/** Drop a country chip from `CampaignRegion.countries`. */
export function campaignRegionCountriesRemove(
  cache: ApolloCache,
  regionId: string,
  countryRowId: string
): void {
  cache.modify({
    id: cache.identify({ __typename: 'CampaignRegion', id: regionId }),
    fields: {
      countries(existing: readonly Reference[] = [], { readField }) {
        return existing.filter(
          (candidate) => readField('id', candidate) !== countryRowId
        )
      }
    }
  })
}

/** Append a Share Language to `CampaignRegion.languages` unless already listed. */
export function campaignRegionLanguagesAdd(
  cache: ApolloCache,
  regionId: string,
  regionLanguage: CampaignRegionRef
): void {
  cache.modify({
    id: cache.identify({ __typename: 'CampaignRegion', id: regionId }),
    fields: {
      languages(existing: readonly Reference[] = [], { toReference }) {
        const ref = toReference(regionLanguage)
        if (
          ref == null ||
          existing.some((candidate) => candidate.__ref === ref.__ref)
        )
          return existing
        return [...existing, ref]
      }
    }
  })
}

/** Drop a Share Language from `CampaignRegion.languages` and evict its row. */
export function campaignRegionLanguagesRemove(
  cache: ApolloCache,
  regionId: string,
  regionLanguageId: string
): void {
  cache.modify({
    id: cache.identify({ __typename: 'CampaignRegion', id: regionId }),
    fields: {
      languages(existing: readonly Reference[] = [], { readField }) {
        return existing.filter(
          (candidate) => readField('id', candidate) !== regionLanguageId
        )
      }
    }
  })
  cache.evict({
    id: cache.identify({
      __typename: 'CampaignRegionLanguage',
      id: regionLanguageId
    })
  })
  cache.gc()
}
