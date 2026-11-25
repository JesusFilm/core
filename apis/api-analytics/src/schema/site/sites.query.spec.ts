import { sites } from '@core/prisma/analytics/client'
import { graphql } from '@core/shared/gql'

import { getAuthenticatedClient, getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

const SITES_QUERY = graphql(`
  query Sites($domainStartsWith: String, $after: String, $first: Int) {
    sites(domainStartsWith: $domainStartsWith, after: $after, first: $first) {
      id
      domain
    }
  }
`)

describe('sitesQuery', () => {
  const client = getAuthenticatedClient()

  const ownedByCaller = {
    site_memberships: { some: { role: 'owner', user_id: 1 } }
  }

  it('returns the sites the caller owns, ordered by id', async () => {
    prismaMock.sites.findMany.mockResolvedValue([
      { id: BigInt(1), domain: 'api-journeys-journey-a' },
      { id: BigInt(2), domain: 'api-journeys-team-b' }
    ] as unknown as sites[])

    const data = await client({
      document: SITES_QUERY,
      variables: { domainStartsWith: 'api-journeys-' }
    })

    expect(prismaMock.sites.findMany).toHaveBeenCalledWith({
      where: {
        domain: { startsWith: 'api-journeys-' },
        id: undefined,
        ...ownedByCaller
      },
      orderBy: { id: 'asc' },
      take: 100
    })
    expect(data).toEqual({
      data: {
        sites: [
          { id: '1', domain: 'api-journeys-journey-a' },
          { id: '2', domain: 'api-journeys-team-b' }
        ]
      }
    })
  })

  it('pages after the given id and caps the page size', async () => {
    prismaMock.sites.findMany.mockResolvedValue([])

    await client({
      document: SITES_QUERY,
      variables: { after: '42', first: 5000 }
    })

    expect(prismaMock.sites.findMany).toHaveBeenCalledWith({
      where: {
        domain: undefined,
        id: { gt: BigInt(42) },
        ...ownedByCaller
      },
      orderBy: { id: 'asc' },
      take: 1000
    })
  })

  it('rejects a cursor that is not a site id', async () => {
    const data = await client({
      document: SITES_QUERY,
      variables: { after: 'not-an-id' }
    })

    // The message itself is masked under Vitest, where yoga and the resolver
    // load different builds of graphql; the bundled service shows it.
    expect(prismaMock.sites.findMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: null,
      errors: [expect.objectContaining({ path: ['sites'] })]
    })
  })

  it('requires an API key', async () => {
    const data = await getClient()({ document: SITES_QUERY })

    expect(prismaMock.sites.findMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: expect.any(String) })]
    })
  })
})
