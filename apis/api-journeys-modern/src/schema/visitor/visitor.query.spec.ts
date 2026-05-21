import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { Visitor } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('visitor', () => {
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

  const VISITOR_QUERY = graphql(`
    query Visitor($id: ID!) {
      visitor(id: $id) {
        id
        name
        email
      }
    }
  `)

  const createMockVisitor = (overrides: Partial<Visitor> = {}): Visitor => ({
    id: 'visitorId',
    createdAt: new Date('2024-01-01'),
    countryCode: null,
    duration: 0,
    email: null,
    lastChatStartedAt: null,
    lastChatPlatform: null,
    lastStepViewedAt: null,
    lastLinkAction: null,
    lastTextResponse: null,
    lastRadioQuestion: null,
    lastRadioOptionSubmission: null,
    messagePlatform: null,
    messagePlatformId: null,
    name: null,
    notes: null,
    phone: null,
    status: null,
    referrer: null,
    teamId: 'teamId',
    userId: 'visitorUserId',
    userAgent: null,
    updatedAt: new Date('2024-01-01'),
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('should return visitor when user is the visitor owner', async () => {
    const visitor = createMockVisitor({
      name: 'John',
      email: 'john@example.com',
      userId: mockUser.id
    })
    const visitorWithAcl = {
      ...visitor,
      team: { id: 'teamId', userTeams: [] },
      journeyVisitors: []
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)
    ;(prismaMock.visitor as any).findUniqueOrThrow?.mockResolvedValue?.(visitor)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeUndefined()
    expect(result.data?.visitor).toMatchObject({
      id: 'visitorId',
      name: 'John',
      email: 'john@example.com'
    })
  })

  it('should return visitor when user is a team member', async () => {
    const visitor = createMockVisitor({ name: 'Jane' })
    const visitorWithAcl = {
      ...visitor,
      team: {
        id: 'teamId',
        userTeams: [{ userId: mockUser.id, role: 'member' }]
      },
      journeyVisitors: []
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)
    ;(prismaMock.visitor as any).findUniqueOrThrow?.mockResolvedValue?.(visitor)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeUndefined()
    expect(result.data?.visitor).toMatchObject({
      id: 'visitorId',
      name: 'Jane'
    })
  })

  it('should return visitor when user is a team manager', async () => {
    const visitor = createMockVisitor()
    const visitorWithAcl = {
      ...visitor,
      team: {
        id: 'teamId',
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      journeyVisitors: []
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)
    ;(prismaMock.visitor as any).findUniqueOrThrow?.mockResolvedValue?.(visitor)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeUndefined()
    expect(result.data?.visitor).toBeDefined()
  })

  it('should return visitor when user is a journey owner', async () => {
    const visitor = createMockVisitor()
    const visitorWithAcl = {
      ...visitor,
      team: { id: 'teamId', userTeams: [] },
      journeyVisitors: [
        {
          journey: {
            userJourneys: [{ userId: mockUser.id, role: 'owner' }]
          }
        }
      ]
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)
    ;(prismaMock.visitor as any).findUniqueOrThrow?.mockResolvedValue?.(visitor)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeUndefined()
    expect(result.data?.visitor).toBeDefined()
  })

  it('should return visitor when user is a journey editor', async () => {
    const visitor = createMockVisitor()
    const visitorWithAcl = {
      ...visitor,
      team: { id: 'teamId', userTeams: [] },
      journeyVisitors: [
        {
          journey: {
            userJourneys: [{ userId: mockUser.id, role: 'editor' }]
          }
        }
      ]
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)
    ;(prismaMock.visitor as any).findUniqueOrThrow?.mockResolvedValue?.(visitor)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeUndefined()
    expect(result.data?.visitor).toBeDefined()
  })

  it('should throw NOT_FOUND when visitor does not exist', async () => {
    prismaMock.visitor.findUnique.mockResolvedValue(null)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'nonexistent' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain(
      'visitor with id "nonexistent" not found'
    )
  })

  it('should throw FORBIDDEN when user has no access', async () => {
    const visitor = createMockVisitor()
    const visitorWithAcl = {
      ...visitor,
      team: { id: 'teamId', userTeams: [] },
      journeyVisitors: []
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)

    const result = (await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain(
      'user is not allowed to view visitor'
    )
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })

  it('should not call findUniqueOrThrow when ACL denies access', async () => {
    const visitor = createMockVisitor()
    const visitorWithAcl = {
      ...visitor,
      team: { id: 'teamId', userTeams: [] },
      journeyVisitors: []
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)

    await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })

    expect((prismaMock.visitor as any).findUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('should spread Pothos query into findUniqueOrThrow', async () => {
    const visitor = createMockVisitor({ userId: mockUser.id })
    const visitorWithAcl = {
      ...visitor,
      team: { id: 'teamId', userTeams: [] },
      journeyVisitors: []
    }
    prismaMock.visitor.findUnique.mockResolvedValue(visitorWithAcl as any)
    ;(prismaMock.visitor as any).findUniqueOrThrow?.mockResolvedValue?.(visitor)

    await authClient({
      document: VISITOR_QUERY,
      variables: { id: 'visitorId' }
    })

    expect((prismaMock.visitor as any).findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'visitorId' }
      })
    )
  })
})
