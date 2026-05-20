import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole, Visitor } from '@core/prisma/journeys/client'
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

describe('visitorsConnection', () => {
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

  const VISITORS_CONNECTION_QUERY = graphql(`
    query VisitorsConnection($teamId: String, $first: Int, $after: String) {
      visitorsConnection(teamId: $teamId, first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            name
            email
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
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

  const teamMembershipWhere = {
    team: {
      userTeams: {
        some: {
          userId: mockUser.id,
          role: { in: [UserTeamRole.manager, UserTeamRole.member] }
        }
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('should return visitors connection for authenticated user', async () => {
    const mockVisitor = createMockVisitor({
      id: 'visitor1',
      name: 'John',
      email: 'john@example.com'
    })
    prismaMock.visitor.findMany.mockResolvedValue([mockVisitor])

    const result = (await authClient({
      document: VISITORS_CONNECTION_QUERY,
      variables: { teamId: 'teamId' }
    })) as ExecutionResult

    expect(result.errors).toBeUndefined()
    expect(result.data?.visitorsConnection).toEqual({
      edges: [
        {
          cursor: 'visitor1',
          node: {
            id: 'visitor1',
            name: 'John',
            email: 'john@example.com'
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'visitor1',
        endCursor: 'visitor1'
      }
    })
  })

  it('should filter by teamId and team membership when teamId provided', async () => {
    prismaMock.visitor.findMany.mockResolvedValue([])

    await authClient({
      document: VISITORS_CONNECTION_QUERY,
      variables: { teamId: 'teamId' }
    })

    expect(prismaMock.visitor.findMany).toHaveBeenCalledWith({
      where: { ...teamMembershipWhere, teamId: 'teamId' },
      cursor: undefined,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 51
    })
  })

  it('should scope to user teams when teamId not provided', async () => {
    prismaMock.visitor.findMany.mockResolvedValue([])

    await authClient({
      document: VISITORS_CONNECTION_QUERY
    })

    expect(prismaMock.visitor.findMany).toHaveBeenCalledWith({
      where: teamMembershipWhere,
      cursor: undefined,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 51
    })
  })

  it('should handle cursor-based pagination with after', async () => {
    prismaMock.visitor.findMany.mockResolvedValue([])

    await authClient({
      document: VISITORS_CONNECTION_QUERY,
      variables: { after: 'cursorId', first: 10 }
    })

    expect(prismaMock.visitor.findMany).toHaveBeenCalledWith({
      where: teamMembershipWhere,
      cursor: { id: 'cursorId' },
      orderBy: { createdAt: 'desc' },
      skip: 1,
      take: 11
    })
  })

  it('should set hasNextPage to true when more results exist', async () => {
    const visitors = Array.from({ length: 3 }, (_, i) =>
      createMockVisitor({ id: `visitor${i}` })
    )
    prismaMock.visitor.findMany.mockResolvedValue(visitors)

    const result = (await authClient({
      document: VISITORS_CONNECTION_QUERY,
      variables: { first: 2 }
    })) as ExecutionResult

    expect(result.data?.visitorsConnection.pageInfo.hasNextPage).toBe(true)
    expect(result.data?.visitorsConnection.edges).toHaveLength(2)
  })

  it('should return empty connection when no visitors found', async () => {
    prismaMock.visitor.findMany.mockResolvedValue([])

    const result = (await authClient({
      document: VISITORS_CONNECTION_QUERY
    })) as ExecutionResult

    expect(result.data?.visitorsConnection).toEqual({
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null
      }
    })
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: VISITORS_CONNECTION_QUERY
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })
})
