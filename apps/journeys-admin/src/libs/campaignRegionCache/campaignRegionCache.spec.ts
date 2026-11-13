import { InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'

import {
  campaignWithRegions,
  eurEnglish,
  eurFrench
} from '../../components/CampaignEditor/data'
import { campaignCache } from '../../components/CampaignEditor/testing'
import { GET_CAMPAIGN } from '../useCampaignQuery'

import {
  campaignRegionCountriesAdd,
  campaignRegionCountriesRemove,
  campaignRegionLanguagesAdd,
  campaignRegionLanguagesRemove,
  campaignRegionsAdd,
  campaignRegionsRemove
} from './campaignRegionCache'

const REGION_ROWS = parse(`
  query CampaignRegionRows($id: ID!) {
    campaign(id: $id) {
      id
      regions {
        id
        countries {
          id
        }
        languages {
          id
        }
      }
    }
  }
`)

const NEW_REGION = parse(`
  fragment NewCampaignRegion on CampaignRegion {
    id
    name
    countries {
      id
    }
    languages {
      id
    }
  }
`)

const NEW_COUNTRY = parse(`
  fragment NewCampaignRegionCountry on CampaignRegionCountry {
    id
    regionId
    countryId
  }
`)

const NEW_LANGUAGE = parse(`
  fragment NewCampaignRegionLanguage on CampaignRegionLanguage {
    id
    regionId
    languageId
  }
`)

type RegionRow = {
  id: string
  countries: Array<{ id: string }>
  languages: Array<{ id: string }>
}

function seededCache(): InMemoryCache {
  const cache = campaignCache()
  cache.writeQuery({
    query: GET_CAMPAIGN,
    variables: { id: campaignWithRegions.id },
    data: { campaign: campaignWithRegions }
  })
  return cache
}

function regionRows(cache: InMemoryCache): RegionRow[] {
  return (
    cache.readQuery<{ campaign: { regions: RegionRow[] } }>({
      query: REGION_ROWS,
      variables: { id: campaignWithRegions.id }
    })?.campaign.regions ?? []
  )
}

function regionIds(cache: InMemoryCache): string[] {
  return regionRows(cache).map(({ id }) => id)
}

function eurRow(cache: InMemoryCache): RegionRow | undefined {
  return regionRows(cache).find(({ id }) => id === 'eurRegionId')
}

const asiaRegion = {
  __typename: 'CampaignRegion',
  id: 'asiaRegionId',
  name: 'Asia',
  countries: [],
  languages: []
}

const germany = {
  __typename: 'CampaignRegionCountry',
  id: 'eurCountry-DE',
  regionId: 'eurRegionId',
  countryId: 'DE'
}

const eurSpanish = {
  __typename: 'CampaignRegionLanguage',
  id: 'eurRegionId-21028',
  regionId: 'eurRegionId',
  languageId: '21028'
}

describe('campaignRegionsAdd', () => {
  it('appends a cached region to Campaign.regions', () => {
    const cache = seededCache()
    cache.writeFragment({
      id: cache.identify(asiaRegion),
      fragment: NEW_REGION,
      data: asiaRegion
    })

    campaignRegionsAdd(cache, campaignWithRegions.id, asiaRegion)

    expect(regionIds(cache)).toEqual([
      'eurRegionId',
      'afrRegionId',
      'asiaRegionId'
    ])
  })

  it('does not list a region twice', () => {
    const cache = seededCache()

    campaignRegionsAdd(cache, campaignWithRegions.id, {
      __typename: 'CampaignRegion',
      id: 'afrRegionId'
    })

    expect(regionIds(cache)).toEqual(['eurRegionId', 'afrRegionId'])
  })
})

describe('campaignRegionsRemove', () => {
  it('unlists the region and evicts its row and its Share Languages', () => {
    const cache = seededCache()

    campaignRegionsRemove(cache, campaignWithRegions.id, 'afrRegionId')

    expect(regionIds(cache)).toEqual(['eurRegionId'])
    const rows = cache.extract()
    expect(rows['CampaignRegion:afrRegionId']).toBeUndefined()
    expect(rows['CampaignRegionLanguage:afrRegionId-529']).toBeUndefined()
  })

  it('keeps the other regions and their rows', () => {
    const cache = seededCache()

    campaignRegionsRemove(cache, campaignWithRegions.id, 'afrRegionId')

    expect(eurRow(cache)).toEqual({
      __typename: 'CampaignRegion',
      id: 'eurRegionId',
      countries: [{ __typename: 'CampaignRegionCountry', id: 'eurCountry-FR' }],
      languages: [
        { __typename: 'CampaignRegionLanguage', id: eurEnglish.id },
        { __typename: 'CampaignRegionLanguage', id: eurFrench.id }
      ]
    })
  })
})

describe('campaignRegionCountriesAdd', () => {
  it("appends a cached country chip to the region's countries", () => {
    const cache = seededCache()
    cache.writeFragment({
      id: cache.identify(germany),
      fragment: NEW_COUNTRY,
      data: germany
    })

    campaignRegionCountriesAdd(cache, 'eurRegionId', germany)

    expect(eurRow(cache)?.countries.map(({ id }) => id)).toEqual([
      'eurCountry-FR',
      'eurCountry-DE'
    ])
  })

  it('does not list a country chip twice', () => {
    const cache = seededCache()

    campaignRegionCountriesAdd(cache, 'eurRegionId', {
      __typename: 'CampaignRegionCountry',
      id: 'eurCountry-FR'
    })

    expect(eurRow(cache)?.countries.map(({ id }) => id)).toEqual([
      'eurCountry-FR'
    ])
  })
})

describe('campaignRegionCountriesRemove', () => {
  it("drops the country chip from the region's countries", () => {
    const cache = seededCache()

    campaignRegionCountriesRemove(cache, 'eurRegionId', 'eurCountry-FR')

    expect(eurRow(cache)?.countries).toEqual([])
  })

  it('leaves the countries unchanged when the chip is not listed', () => {
    const cache = seededCache()

    campaignRegionCountriesRemove(cache, 'eurRegionId', 'eurCountry-DE')

    expect(eurRow(cache)?.countries.map(({ id }) => id)).toEqual([
      'eurCountry-FR'
    ])
  })
})

describe('campaignRegionLanguagesAdd', () => {
  it("appends a cached Share Language to the region's languages", () => {
    const cache = seededCache()
    cache.writeFragment({
      id: cache.identify(eurSpanish),
      fragment: NEW_LANGUAGE,
      data: eurSpanish
    })

    campaignRegionLanguagesAdd(cache, 'eurRegionId', eurSpanish)

    expect(eurRow(cache)?.languages.map(({ id }) => id)).toEqual([
      eurEnglish.id,
      eurFrench.id,
      eurSpanish.id
    ])
  })

  it('does not list a Share Language twice', () => {
    const cache = seededCache()

    campaignRegionLanguagesAdd(cache, 'eurRegionId', eurFrench)

    expect(eurRow(cache)?.languages.map(({ id }) => id)).toEqual([
      eurEnglish.id,
      eurFrench.id
    ])
  })
})

describe('campaignRegionLanguagesRemove', () => {
  it('unlists the Share Language and evicts its row', () => {
    const cache = seededCache()

    campaignRegionLanguagesRemove(cache, 'eurRegionId', eurFrench.id)

    expect(eurRow(cache)?.languages.map(({ id }) => id)).toEqual([
      eurEnglish.id
    ])
    const rows = cache.extract()
    expect(rows[`CampaignRegionLanguage:${eurFrench.id}`]).toBeUndefined()
    expect(rows[`CampaignRegionLanguage:${eurEnglish.id}`]).toMatchObject({
      id: eurEnglish.id
    })
  })
})
