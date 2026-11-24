import { sites } from '@core/prisma/analytics/client'
import { graphql } from '@core/shared/gql'

import { getAuthenticatedClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { fixedDate } from '../../../test/timers'

const SITES_ALLOW_EVENT_PROPS_MUTATION = graphql(`
  mutation SitesAllowEventProps($input: SitesAllowEventPropsInput!) {
    sitesAllowEventProps(input: $input)
  }
`)

function site(id: string, allowedEventProps: string[] | null): sites {
  return { id, allowed_event_props: allowedEventProps } as unknown as sites
}

describe('sitesAllowEventPropsMutation', () => {
  const client = getAuthenticatedClient()
  const date = fixedDate()

  beforeEach(() => {
    prismaMock.sites.update.mockImplementation(
      (args) => args as unknown as ReturnType<typeof prismaMock.sites.update>
    )
    prismaMock.$transaction.mockResolvedValue([])
  })

  it("finds, in one query, the caller's sites under the prefix that lack a prop", async () => {
    prismaMock.sites.findMany.mockResolvedValue([])

    const data = await client({
      document: SITES_ALLOW_EVENT_PROPS_MUTATION,
      variables: {
        input: {
          domainPrefix: 'api-journeys-campaign-',
          props: ['region', 'language']
        }
      }
    })

    expect(prismaMock.sites.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.sites.findMany).toHaveBeenCalledWith({
      select: { id: true, allowed_event_props: true },
      where: {
        domain: { startsWith: 'api-journeys-campaign-' },
        site_memberships: { some: { user_id: 1, role: 'owner' } },
        OR: [
          { allowed_event_props: { equals: null } },
          { NOT: { allowed_event_props: { hasEvery: ['region', 'language'] } } }
        ]
      }
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(data).toEqual({ data: { sitesAllowEventProps: 0 } })
  })

  it('adds only the missing props, keeping the ones each site already allows', async () => {
    prismaMock.sites.findMany.mockResolvedValue([
      site('older', ['source', 'region']),
      site('neverSet', null)
    ])

    const data = await client({
      document: SITES_ALLOW_EVENT_PROPS_MUTATION,
      variables: {
        input: {
          domainPrefix: 'api-journeys-campaign-',
          props: ['region', 'language']
        }
      }
    })

    expect(prismaMock.sites.update).toHaveBeenCalledWith({
      where: { id: 'older' },
      data: {
        allowed_event_props: ['source', 'region', 'language'],
        updated_at: date
      }
    })
    expect(prismaMock.sites.update).toHaveBeenCalledWith({
      where: { id: 'neverSet' },
      data: { allowed_event_props: ['region', 'language'], updated_at: date }
    })
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(data).toEqual({ data: { sitesAllowEventProps: 2 } })
  })

  it('does nothing for an empty props list', async () => {
    const data = await client({
      document: SITES_ALLOW_EVENT_PROPS_MUTATION,
      variables: {
        input: { domainPrefix: 'api-journeys-campaign-', props: [] }
      }
    })

    expect(prismaMock.sites.findMany).not.toHaveBeenCalled()
    expect(data).toEqual({ data: { sitesAllowEventProps: 0 } })
  })
})
