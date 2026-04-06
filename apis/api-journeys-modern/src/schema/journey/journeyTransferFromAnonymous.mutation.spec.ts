import { ExecutionResult } from 'graphql'

import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('@core/prisma/users/client', () => ({
  prisma: {
    user: {
      findFirst: jest.fn()
    }
  }
}))

const { prisma: mockPrismaUsers } = jest.requireMock(
  '@core/prisma/users/client'
)

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const JOURNEY_TRANSFER_MUTATION = graphql(`
  mutation JourneyTransferFromAnonymous($journeyId: ID!, $teamId: ID) {
    journeyTransferFromAnonymous(journeyId: $journeyId, teamId: $teamId) {
      id
    }
  }
`)

describe('journeyTransferFromAnonymous', () => {
  const mockUser = {
    id: 'authUserId',
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

  const mockJourney = {
    id: 'journeyId',
    teamId: 'anonTeamId',
    userJourneys: [
      {
        id: 'ujId',
        userId: 'anonUserId',
        journeyId: 'journeyId',
        role: UserJourneyRole.owner,
        updatedAt: new Date()
      }
    ],
    team: {
      id: 'anonTeamId',
      userTeams: [
        {
          id: 'utId',
          userId: 'anonUserId',
          teamId: 'anonTeamId',
          role: UserTeamRole.manager
        }
      ]
    }
  }

  const mockUserTeam = {
    id: 'targetUtId',
    userId: mockUser.id,
    teamId: 'targetTeamId',
    role: UserTeamRole.manager,
    createdAt: new Date(),
    updatedAt: new Date()
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

  function makeTxMock(targetTeamId = 'targetTeamId') {
    return {
      userJourney: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({
          id: 'newUjId',
          userId: mockUser.id,
          journeyId: 'journeyId',
          role: UserJourneyRole.owner
        })
      },
      journey: {
        update: jest.fn().mockResolvedValue({
          id: 'journeyId',
          teamId: targetTeamId
        }),
        count: jest.fn().mockResolvedValue(0)
      },
      userTeam: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 })
      },
      team: {
        delete: jest.fn().mockResolvedValue({})
      }
    }
  }

  it('should transfer journey with explicit teamId', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockPrismaUsers.user.findFirst.mockResolvedValue({ email: null })
    prismaMock.userTeam.findFirst.mockResolvedValue(mockUserTeam)

    const txMock = makeTxMock()
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId', teamId: 'targetTeamId' }
    })) as ExecutionResult<{
      journeyTransferFromAnonymous: { id: string }
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyTransferFromAnonymous.id).toBe('journeyId')
    expect(txMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId' },
        data: { teamId: 'targetTeamId' }
      })
    )
  })

  it('should auto-resolve to first managed team when teamId is omitted', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockPrismaUsers.user.findFirst.mockResolvedValue({ email: null })

    prismaMock.userTeam.findFirst
      .mockResolvedValueOnce(mockUserTeam)
      .mockResolvedValueOnce(mockUserTeam)

    const txMock = makeTxMock()
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId' }
    })) as ExecutionResult<{
      journeyTransferFromAnonymous: { id: string }
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyTransferFromAnonymous.id).toBe('journeyId')
    expect(prismaMock.userTeam.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: mockUser.id,
          role: UserTeamRole.manager
        },
        orderBy: { createdAt: 'asc' }
      })
    )
    expect(txMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { teamId: 'targetTeamId' }
      })
    )
  })

  it('should return error if journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'nonExistent' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('Journey not found')
  })

  it('should move team without changing ownership when user already owns (linked account)', async () => {
    const ownedJourney = {
      ...mockJourney,
      userJourneys: [
        {
          ...mockJourney.userJourneys[0],
          userId: mockUser.id
        }
      ]
    }
    prismaMock.journey.findUnique.mockResolvedValue(ownedJourney as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(mockUserTeam)

    const txMock = makeTxMock()
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId' }
    })) as ExecutionResult<{
      journeyTransferFromAnonymous: { id: string }
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyTransferFromAnonymous.id).toBe('journeyId')
    expect(txMock.userJourney.deleteMany).not.toHaveBeenCalled()
    expect(txMock.userJourney.create).not.toHaveBeenCalled()
    expect(txMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { teamId: 'targetTeamId' }
      })
    )
  })

  it('should no-op when user already owns and team is already correct', async () => {
    const ownedJourney = {
      ...mockJourney,
      teamId: 'targetTeamId',
      userJourneys: [
        {
          ...mockJourney.userJourneys[0],
          userId: mockUser.id
        }
      ]
    }
    prismaMock.journey.findUnique.mockResolvedValue(ownedJourney as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(mockUserTeam)
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue({
      id: 'journeyId',
      teamId: 'targetTeamId'
    } as any)

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId' }
    })) as ExecutionResult<{
      journeyTransferFromAnonymous: { id: string }
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyTransferFromAnonymous.id).toBe('journeyId')
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('should return error if journey owner is not anonymous', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockPrismaUsers.user.findFirst.mockResolvedValue({
      email: 'owner@example.com'
    })

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toContain('not an anonymous user')
  })

  it('should fall through to auto-resolve when provided teamId user is not a member of', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockPrismaUsers.user.findFirst.mockResolvedValue({ email: null })

    prismaMock.userTeam.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUserTeam)
      .mockResolvedValueOnce(mockUserTeam)

    const txMock = makeTxMock()
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId', teamId: 'invalidTeamId' }
    })) as ExecutionResult<{
      journeyTransferFromAnonymous: { id: string }
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeyTransferFromAnonymous.id).toBe('journeyId')
    expect(txMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { teamId: 'targetTeamId' }
      })
    )
  })

  it('should return error if user has no teams', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockPrismaUsers.user.findFirst.mockResolvedValue({ email: null })
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = (await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toContain('No team found')
  })

  it('should not delete old team if other journeys remain', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockPrismaUsers.user.findFirst.mockResolvedValue({ email: null })
    prismaMock.userTeam.findFirst.mockResolvedValue(mockUserTeam)

    const txMock = makeTxMock()
    txMock.journey.count.mockResolvedValue(2)
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(txMock))

    await authClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId', teamId: 'targetTeamId' }
    })

    expect(txMock.userTeam.deleteMany).not.toHaveBeenCalled()
    expect(txMock.team.delete).not.toHaveBeenCalled()
  })

  it('should require authentication', async () => {
    const publicClient = getClient()

    const result = (await publicClient({
      document: JOURNEY_TRANSFER_MUTATION,
      variables: { journeyId: 'journeyId' }
    })) as ExecutionResult

    expect(result.errors).toBeDefined()
  })
})
