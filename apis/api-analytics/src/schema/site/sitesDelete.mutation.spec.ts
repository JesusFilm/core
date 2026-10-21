import { graphql } from '@core/shared/gql'

import { getAuthenticatedClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { MAX_DOMAINS_PER_DELETE } from './sitesDelete.mutation'

const SITES_DELETE_MUTATION = graphql(`
  mutation SitesDelete($domains: [String!]!) {
    sitesDelete(domains: $domains) {
      ... on Error {
        message
        __typename
      }
      ... on MutationSitesDeleteSuccess {
        data
        __typename
      }
    }
  }
`)

describe('sitesDeleteMutation', () => {
  const client = getAuthenticatedClient()

  it('deletes only the listed sites the caller owns', async () => {
    prismaMock.sites.deleteMany.mockResolvedValue({ count: 2 })

    const data = await client({
      document: SITES_DELETE_MUTATION,
      variables: {
        domains: ['api-journeys-journey-a', 'api-journeys-journey-b']
      }
    })

    expect(prismaMock.sites.deleteMany).toHaveBeenCalledWith({
      where: {
        domain: { in: ['api-journeys-journey-a', 'api-journeys-journey-b'] },
        site_memberships: { some: { role: 'owner', user_id: 1 } }
      }
    })
    expect(data).toEqual({
      data: {
        sitesDelete: { __typename: 'MutationSitesDeleteSuccess', data: 2 }
      }
    })
  })

  it('does nothing for an empty list', async () => {
    const data = await client({
      document: SITES_DELETE_MUTATION,
      variables: { domains: [] }
    })

    expect(prismaMock.sites.deleteMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: {
        sitesDelete: { __typename: 'MutationSitesDeleteSuccess', data: 0 }
      }
    })
  })

  it('refuses more domains than one call allows', async () => {
    const domains = Array.from(
      { length: MAX_DOMAINS_PER_DELETE + 1 },
      (_, index) => `api-journeys-journey-${index}`
    )

    const data = await client({
      document: SITES_DELETE_MUTATION,
      variables: { domains }
    })

    expect(prismaMock.sites.deleteMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: {
        sitesDelete: {
          __typename: 'Error',
          message: `at most ${MAX_DOMAINS_PER_DELETE} domains can be deleted at once`
        }
      }
    })
  })
})
