import { ExecutionResult } from 'graphql'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('customDomains', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CUSTOM_DOMAINS_QUERY = graphql(`
    query CustomDomains($teamId: ID!) {
      customDomains(teamId: $teamId) {
        id
        name
        apexName
        routeAllTeamJourneys
      }
    }
  `)

  const mockCustomDomain = {
    id: 'customDomainId',
    name: 'example.com',
    apexName: 'example.com',
    teamId: 'teamId',
    routeAllTeamJourneys: true,
    journeyCollectionId: null,
    createdAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('should return custom domains for authenticated user', async () => {
    prismaMock.customDomain.findMany.mockResolvedValue([
      mockCustomDomain as any
    ])

    const result = (await authClient({
      document: CUSTOM_DOMAINS_QUERY,
      variables: { teamId: 'teamId' }
    })) as ExecutionResult<{
      customDomains: Array<typeof mockCustomDomain>
    }>

    expect(result.data?.customDomains).toHaveLength(1)
    expect(result.data?.customDomains[0]).toMatchObject({
      id: 'customDomainId',
      name: 'example.com',
      apexName: 'example.com',
      routeAllTeamJourneys: true
    })
    expect(prismaMock.customDomain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  team: expect.objectContaining({
                    userTeams: expect.any(Object)
                  })
                })
              ])
            }),
            { teamId: 'teamId' }
          ]
        }
      })
    )
  })

  it('should return empty array when no custom domains exist', async () => {
    prismaMock.customDomain.findMany.mockResolvedValue([])

    const result = (await authClient({
      document: CUSTOM_DOMAINS_QUERY,
      variables: { teamId: 'teamId' }
    })) as ExecutionResult<{
      customDomains: Array<typeof mockCustomDomain>
    }>

    expect(result.data?.customDomains).toHaveLength(0)
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: CUSTOM_DOMAINS_QUERY,
      variables: { teamId: 'teamId' }
    })) as ExecutionResult<{
      customDomains: Array<typeof mockCustomDomain>
    }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })
})
