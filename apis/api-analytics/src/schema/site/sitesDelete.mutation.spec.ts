import { sites } from '@core/prisma/analytics/client'
import { graphql } from '@core/shared/gql'

import { getAuthenticatedClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { MAX_DOMAINS_PER_DELETE } from './sitesDelete.mutation'

const SITES_DELETE_PREPARE_MUTATION = graphql(`
  mutation SitesDeletePrepare($domains: [String!]!) {
    sitesDeletePrepare(domains: $domains) {
      ... on Error {
        message
        __typename
      }
      ... on MutationSitesDeletePrepareSuccess {
        data
        __typename
      }
    }
  }
`)

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

describe('sitesDeletePrepareMutation', () => {
  const client = getAuthenticatedClient()

  it('deletes the goals and setup-help emails of the listed sites the caller owns', async () => {
    prismaMock.sites.findMany.mockResolvedValue([
      { id: BigInt(1) },
      { id: BigInt(2) }
    ] as unknown as sites[])
    prismaMock.goals.deleteMany.mockResolvedValue({ count: 60 })
    prismaMock.setup_help_emails.deleteMany.mockResolvedValue({ count: 2 })

    const data = await client({
      document: SITES_DELETE_PREPARE_MUTATION,
      variables: {
        domains: ['api-journeys-journey-a', 'api-journeys-journey-b']
      }
    })

    expect(prismaMock.sites.findMany).toHaveBeenCalledWith({
      where: {
        domain: { in: ['api-journeys-journey-a', 'api-journeys-journey-b'] },
        site_memberships: { some: { role: 'owner', user_id: 1 } }
      },
      select: { id: true }
    })
    expect(prismaMock.goals.deleteMany).toHaveBeenCalledWith({
      where: { site_id: { in: [BigInt(1), BigInt(2)] } }
    })
    expect(prismaMock.setup_help_emails.deleteMany).toHaveBeenCalledWith({
      where: { site_id: { in: [BigInt(1), BigInt(2)] } }
    })
    expect(prismaMock.sites.deleteMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: {
        sitesDeletePrepare: {
          __typename: 'MutationSitesDeletePrepareSuccess',
          data: 62
        }
      }
    })
  })

  it('deletes nothing when the caller owns none of the sites', async () => {
    prismaMock.sites.findMany.mockResolvedValue([])

    const data = await client({
      document: SITES_DELETE_PREPARE_MUTATION,
      variables: { domains: ['api-journeys-journey-a'] }
    })

    expect(prismaMock.goals.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.setup_help_emails.deleteMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: {
        sitesDeletePrepare: {
          __typename: 'MutationSitesDeletePrepareSuccess',
          data: 0
        }
      }
    })
  })

  it('refuses more domains than one call allows', async () => {
    const domains = Array.from(
      { length: MAX_DOMAINS_PER_DELETE + 1 },
      (_, index) => `api-journeys-journey-${index}`
    )

    const data = await client({
      document: SITES_DELETE_PREPARE_MUTATION,
      variables: { domains }
    })

    expect(prismaMock.sites.findMany).not.toHaveBeenCalled()
    expect(data).toEqual({
      data: {
        sitesDeletePrepare: {
          __typename: 'Error',
          message: `at most ${MAX_DOMAINS_PER_DELETE} domains can be deleted at once`
        }
      }
    })
  })
})
