import { graphql } from 'gql.tada'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { language } from './language.mock'
import { languageName } from './language.mock'

const LANGUAGE_QUERY = graphql(`
  query Language($languageId: ID, $primary: Boolean) {
    language(id: "529") {
      id
      bcp47
      iso3
      name(languageId: $languageId, primary: $primary) {
        value
        primary
      }
    }
  }
`)

describe('language', () => {
  const client = getClient()

  it('should query language', async () => {
    prismaMock.language.findUnique.mockResolvedValue(language)
    prismaMock.languageName.findMany.mockResolvedValue([languageName])
    const data = await client({
      document: LANGUAGE_QUERY,
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
