import { graphql } from 'gql.tada'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

const COUNTRY_QUERY = graphql(`
  query Country($languageId: ID, $primary: Boolean) {
    country(id: "AD") {
      continent(languageId: $languageId, primary: $primary) {
        value
        primary
      }
      flagPngSrc
      flagWebpSrc
      id
      languages {
        id
      }
      latitude
      longitude
      name(languageId: $languageId, primary: $primary) {
        value
        primary
      }
      population
    }
  }
`)

describe('country', () => {
  const client = getClient()

  const country = {
    id: 'US',
    population: 500000000,
    latitude: 10,
    longitude: -20.1,
    flagPngSrc: 'flag.png',
    flagWebpSrc: 'flag.webp'
  }
  const countryName = {
    id: '1',
    countryId: country.id,
    value: 'United States',
    languageId: '529',
    primary: true
  }
  const countryContinent = {
    id: '1',
    countryId: country.id,
    value: 'North America',
    languageId: '529',
    primary: true
  }

  it('should query country', async () => {
    prismaMock.country.findUnique.mockResolvedValue(country)
    prismaMock.countryName.findMany.mockResolvedValue([countryName])
    prismaMock.countryContinent.findMany.mockResolvedValue([countryContinent])
    prismaMock.countryLanguage.findMany.mockResolvedValue([countryLanguage])
    const data = await client({
      document: COUNTRY_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    // expect(prismaMock.country.findUnique).toHaveBeenCalledWith({
    //   data: {
    //     domain: 'https://test-site.com',
    //     goals: {
    //       createMany: {
    //         data: [
    //           {
    //             event_name: 'test-goal',
    //             inserted_at: date,
    //             updated_at: date
    //           }
    //         ]
    //       }
    //     },
    //     inserted_at: date,
    //     shared_links: {
    //       create: {
    //         inserted_at: date,
    //         name: 'api-analytics',
    //         slug: 'test-slug',
    //         updated_at: date
    //       }
    //     },
    //     site_memberships: {
    //       create: {
    //         inserted_at: date,
    //         role: 'owner',
    //         updated_at: date,
    //         users: {
    //           connect: {
    //             id: 1
    //           }
    //         }
    //       }
    //     },
    //     timezone: 'Etc/UTC',
    //     updated_at: date
    //   },
    //   include: {
    //     goals: true,
    //     shared_links: true,
    //     site_memberships: true
    //   }
    // })
    expect(data.data.country).toEqual({
      ...country
    })
  })

  // it('should create a site without goals', async () => {
  //   const site = {
  //     id: 'siteId',
  //     domain: 'https://test-site.com',
  //     site_memberships: [
  //       {
  //         id: 'membershipId',
  //         role: 'owner'
  //       }
  //     ],
  //     goals: [],
  //     shared_links: [
  //       {
  //         id: 'sharedLinkId',
  //         name: 'api-analytics',
  //         slug: 'test-slug'
  //       }
  //     ]
  //   }
  //   prismaMock.sites.create.mockResolvedValue(site)
  //   const data = await client({
  //     document: SITE_CREATE_MUTATION,
  //     variables: {
  //       input: {
  //         domain: 'https://test-site.com'
  //       }
  //     }
  //   })
  //   expect(prismaMock.sites.create).toHaveBeenCalledWith({
  //     data: {
  //       domain: 'https://test-site.com',
  //       inserted_at: date,
  //       shared_links: {
  //         create: {
  //           inserted_at: date,
  //           name: 'api-analytics',
  //           slug: 'test-slug',
  //           updated_at: date
  //         }
  //       },
  //       site_memberships: {
  //         create: {
  //           inserted_at: date,
  //           role: 'owner',
  //           updated_at: date,
  //           users: {
  //             connect: {
  //               id: 1
  //             }
  //           }
  //         }
  //       },
  //       timezone: 'Etc/UTC',
  //       updated_at: date
  //     },
  //     include: {
  //       goals: true,
  //       shared_links: true,
  //       site_memberships: true
  //     }
  //   })
  //   expect(data).toEqual({
  //     data: {
  //       siteCreate: {
  //         data: {
  //           __typename: 'Site',
  //           domain: 'https://test-site.com',
  //           goals: [],
  //           id: 'siteId',
  //           memberships: [
  //             {
  //               __typename: 'SiteMembership',
  //               id: 'membershipId',
  //               role: 'owner'
  //             }
  //           ],
  //           sharedLinks: [
  //             {
  //               __typename: 'SiteSharedLink',
  //               id: 'sharedLinkId',
  //               slug: 'test-slug'
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   })
  // })

  it('should return null when no country found', async () => {
    prismaMock.country.findUnique.mockResolvedValue(null)
    const data = await client({
      document: COUNTRY_QUERY
    })
    expect(data.data.country).toEqual(null)
  })
})
