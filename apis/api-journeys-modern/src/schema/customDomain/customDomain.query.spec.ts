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

describe('customDomain', () => {
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

  const CUSTOM_DOMAIN_QUERY = graphql(`
    query CustomDomain($id: ID!) {
      customDomain(id: $id) {
        id
        name
        apexName
        routeAllTeamJourneys
      }
    }
  `)

  const mockCustomDomain = {
    id: 'customDomainId',
    teamId: 'teamId',
    name: 'example.com',
    apexName: 'example.com',
    journeyCollectionId: null,
    routeAllTeamJourneys: true
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

  it('should return custom domain when user is team manager', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [{ userId: 'userId', role: 'manager' }],
        journeys: []
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )
    ;(prismaMock.customDomain as any).findUniqueOrThrow?.mockResolvedValue?.(
      mockCustomDomain as any
    )

    const result = (await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.data?.customDomain).toMatchObject({
      id: 'customDomainId',
      name: 'example.com',
      apexName: 'example.com',
      routeAllTeamJourneys: true
    })
  })

  it('should return custom domain when user is team member', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [{ userId: 'userId', role: 'member' }],
        journeys: []
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )
    ;(prismaMock.customDomain as any).findUniqueOrThrow?.mockResolvedValue?.(
      mockCustomDomain as any
    )

    const result = (await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.data?.customDomain).toMatchObject({
      id: 'customDomainId',
      name: 'example.com'
    })
  })

  it('should return custom domain when user is journey owner in team', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [],
        journeys: [{ userJourneys: [{ userId: 'userId', role: 'owner' }] }]
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )
    ;(prismaMock.customDomain as any).findUniqueOrThrow?.mockResolvedValue?.(
      mockCustomDomain as any
    )

    const result = (await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.data?.customDomain).toMatchObject({
      id: 'customDomainId',
      name: 'example.com'
    })
  })

  it('should return custom domain when user is journey editor in team', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [],
        journeys: [{ userJourneys: [{ userId: 'userId', role: 'editor' }] }]
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )
    ;(prismaMock.customDomain as any).findUniqueOrThrow?.mockResolvedValue?.(
      mockCustomDomain as any
    )

    const result = (await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.data?.customDomain).toMatchObject({
      id: 'customDomainId',
      name: 'example.com'
    })
  })

  it('should throw NOT_FOUND when custom domain does not exist', async () => {
    prismaMock.customDomain.findUnique.mockResolvedValue(null)

    const result = (await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'nonexistent' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('custom domain not found')
  })

  it('should throw FORBIDDEN when user has no access', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [],
        journeys: []
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )

    const result = (await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain(
      'user is not allowed to read custom domain'
    )
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })) as ExecutionResult<{ customDomain: typeof mockCustomDomain }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })

  it('should spread Pothos query into findUniqueOrThrow', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [{ userId: 'userId', role: 'manager' }],
        journeys: []
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )
    ;(prismaMock.customDomain as any).findUniqueOrThrow?.mockResolvedValue?.(
      mockCustomDomain as any
    )

    await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })

    expect(
      (prismaMock.customDomain as any).findUniqueOrThrow
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customDomainId' }
      })
    )
  })

  it('should not call findUniqueOrThrow when ACL denies access', async () => {
    const customDomainForAcl = {
      ...mockCustomDomain,
      team: {
        id: 'teamId',
        userTeams: [],
        journeys: []
      }
    }
    prismaMock.customDomain.findUnique.mockResolvedValue(
      customDomainForAcl as any
    )

    await authClient({
      document: CUSTOM_DOMAIN_QUERY,
      variables: { id: 'customDomainId' }
    })

    expect(
      (prismaMock.customDomain as any).findUniqueOrThrow
    ).not.toHaveBeenCalled()
  })
})
