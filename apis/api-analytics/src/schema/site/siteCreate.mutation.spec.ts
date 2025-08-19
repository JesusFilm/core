import { Prisma, sites } from '@core/prisma/analytics/client'
import { graphql } from '@core/shared/gql'

import { getAuthenticatedClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { fixedDate } from '../../../test/timers'

jest.mock('short-unique-id', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ rnd: () => 'test-slug' }))
}))

const SITE_CREATE_MUTATION = graphql(`
  mutation SiteCreate($input: SiteCreateInput!) {
    siteCreate(input: $input) {
      ... on Error {
        message
        __typename
      }
      ... on MutationSiteCreateSuccess {
        data {
          id
          domain
          __typename
          memberships {
            id
            role
            __typename
          }
          goals {
            id
            eventName
            __typename
          }
          sharedLinks {
            id
            slug
            __typename
          }
        }
      }
    }
  }
`)

describe('siteCreateMutation', () => {
  const client = getAuthenticatedClient()
  const date = fixedDate()

  it('should create a site', async () => {
    const site = {
      id: 'siteId',
      domain: 'https://test-site.com',
      site_memberships: [
        {
          id: 'membershipId',
          role: 'owner'
        }
      ],
      goals: [
        {
          id: 'goalId',
          event_name: 'test-goal'
        }
      ],
      shared_links: [
        {
          id: 'sharedLinkId',
          name: 'api-analytics',
          slug: 'test-slug'
        }
      ]
    } as unknown as sites
    prismaMock.sites.create.mockResolvedValue(site)
    prismaMock.sites.findUniqueOrThrow.mockResolvedValue(site)
    const data = await client({
      document: SITE_CREATE_MUTATION,
      variables: {
        input: {
          domain: 'https://test-site.com',
          goals: ['test-goal']
        }
      }
    })
    expect(prismaMock.sites.create).toHaveBeenCalledWith({
      data: {
        domain: 'https://test-site.com',
        goals: {
          createMany: {
            data: [
              {
                event_name: 'test-goal',
                inserted_at: date,
                updated_at: date
              }
            ]
          }
        },
        inserted_at: date,
        shared_links: {
          create: {
            inserted_at: date,
            name: 'api-analytics',
            slug: 'test-slug',
            updated_at: date
          }
        },
        site_memberships: {
          create: {
            inserted_at: date,
            role: 'owner',
            updated_at: date,
            users: {
              connect: {
                id: 1
              }
            }
          }
        },
        timezone: 'Etc/UTC',
        updated_at: date
      },
      include: {
        goals: true,
        shared_links: true,
        site_memberships: true
      }
    })
    expect(data).toEqual({
      data: {
        siteCreate: {
          data: {
            __typename: 'Site',
            domain: 'https://test-site.com',
            goals: [
              {
                __typename: 'SiteGoal',
                id: 'goalId',
                eventName: 'test-goal'
              }
            ],
            id: 'siteId',
            memberships: [
              {
                __typename: 'SiteMembership',
                id: 'membershipId',
                role: 'owner'
              }
            ],
            sharedLinks: [
              {
                __typename: 'SiteSharedLink',
                id: 'sharedLinkId',
                slug: 'test-slug'
              }
            ]
          }
        }
      }
    })
  })

  it('should create a site without goals', async () => {
    const site = {
      id: 'siteId',
      domain: 'https://test-site.com',
      site_memberships: [
        {
          id: 'membershipId',
          role: 'owner'
        }
      ],
      goals: [],
      shared_links: [
        {
          id: 'sharedLinkId',
          name: 'api-analytics',
          slug: 'test-slug'
        }
      ]
    } as unknown as sites
    prismaMock.sites.create.mockResolvedValue(site)
    const data = await client({
      document: SITE_CREATE_MUTATION,
      variables: {
        input: {
          domain: 'https://test-site.com'
        }
      }
    })
    expect(prismaMock.sites.create).toHaveBeenCalledWith({
      data: {
        domain: 'https://test-site.com',
        inserted_at: date,
        shared_links: {
          create: {
            inserted_at: date,
            name: 'api-analytics',
            slug: 'test-slug',
            updated_at: date
          }
        },
        site_memberships: {
          create: {
            inserted_at: date,
            role: 'owner',
            updated_at: date,
            users: {
              connect: {
                id: 1
              }
            }
          }
        },
        timezone: 'Etc/UTC',
        updated_at: date
      },
      include: {
        goals: true,
        shared_links: true,
        site_memberships: true
      }
    })
    expect(data).toEqual({
      data: {
        siteCreate: {
          data: {
            __typename: 'Site',
            domain: 'https://test-site.com',
            goals: [],
            id: 'siteId',
            memberships: [
              {
                __typename: 'SiteMembership',
                id: 'membershipId',
                role: 'owner'
              }
            ],
            sharedLinks: [
              {
                __typename: 'SiteSharedLink',
                id: 'sharedLinkId',
                slug: 'test-slug'
              }
            ]
          }
        }
      }
    })
  })

  it('should throw error when duplicate domain', async () => {
    prismaMock.sites.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`domain`)',
        {
          code: 'P2002',
          clientVersion: 'prismaVersion'
        }
      )
    )
    const data = await client({
      document: SITE_CREATE_MUTATION,
      variables: {
        input: {
          domain: 'https://test-site.com',
          goals: ['test-goal']
        }
      }
    })
    expect(data).toEqual({
      data: {
        siteCreate: {
          __typename: 'Error',
          message: 'domain already exists'
        }
      }
    })
  })

  it('should return the existing site if a user creates a site with a existing domain', async () => {
    const site = {
      id: 'siteId',
      domain: 'https://test-site.com',
      site_memberships: [
        {
          id: 'membershipId',
          role: 'owner'
        }
      ],
      goals: [
        {
          id: 'goalId',
          event_name: 'test-goal'
        }
      ],
      shared_links: [
        {
          id: 'sharedLinkId',
          name: 'api-analytics',
          slug: 'test-slug'
        }
      ]
    } as unknown as sites
    prismaMock.sites.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`domain`)',
        {
          code: 'P2002',
          clientVersion: 'prismaVersion'
        }
      )
    )
    prismaMock.sites.findUnique.mockResolvedValue(site)

    const data = await client({
      document: SITE_CREATE_MUTATION,
      variables: {
        input: {
          domain: 'https://test-site.com',
          goals: ['test-goal']
        }
      }
    })

    expect(prismaMock.sites.findUnique).toHaveBeenCalledWith({
      include: {
        goals: true,
        shared_links: true,
        site_memberships: {
          where: {
            role: 'owner',
            user_id: 1
          }
        }
      },
      where: {
        domain: 'https://test-site.com'
      }
    })

    expect(data).toEqual({
      data: {
        siteCreate: {
          data: {
            __typename: 'Site',
            domain: 'https://test-site.com',
            goals: [
              {
                __typename: 'SiteGoal',
                id: 'goalId',
                eventName: 'test-goal'
              }
            ],
            id: 'siteId',
            memberships: [
              {
                __typename: 'SiteMembership',
                id: 'membershipId',
                role: 'owner'
              }
            ],
            sharedLinks: [
              {
                __typename: 'SiteSharedLink',
                id: 'sharedLinkId',
                slug: 'test-slug'
              }
            ]
          }
        }
      }
    })
  })
})
