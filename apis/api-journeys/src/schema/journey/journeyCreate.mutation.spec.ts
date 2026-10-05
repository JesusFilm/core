import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: vi.fn().mockResolvedValue(undefined) }
  })
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const JOURNEY_CREATE = graphql(`
  mutation JourneyCreate($input: JourneyCreateInput!, $teamId: ID!) {
    journeyCreate(input: $input, teamId: $teamId) {
      id
    }
  }
`)

describe('journeyCreate', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('suffixes a title that slugifies to a reserved slug with the journey id', async () => {
    const created = {
      id: 'journeyId',
      teamId: 'teamId',
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [
          { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
        ]
      }
    }
    prismaMock.journey.findUnique.mockResolvedValue(created as any)
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(created as any)

    const result = (await authClient({
      document: JOURNEY_CREATE,
      variables: {
        input: { id: 'journeyId', title: 'Campaign', languageId: '529' },
        teamId: 'teamId'
      }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(prismaMock.journey.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'campaign-journeyId' })
    })
  })
})
