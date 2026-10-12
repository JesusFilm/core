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

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'duplicateJourneyId')
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const JOURNEY_DUPLICATE = graphql(`
  mutation JourneyDuplicate($id: ID!, $teamId: ID!) {
    journeyDuplicate(id: $id, teamId: $teamId) {
      id
    }
  }
`)

describe('journeyDuplicate', () => {
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

  const team = {
    id: 'teamId',
    userTeams: [
      { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('suffixes a duplicate whose title slugifies to a reserved slug with the duplicate id', async () => {
    const journey = {
      id: 'journeyId',
      title: 'Embed',
      slug: 'embed-journeyId',
      teamId: 'teamId',
      template: false,
      userJourneys: [],
      journeyTags: [],
      team,
      journeyCustomizationFields: [],
      journeyTheme: null,
      chatButtons: []
    }
    const duplicate = {
      id: 'duplicateJourneyId',
      teamId: 'teamId',
      userJourneys: [],
      team
    }
    prismaMock.journey.findUnique
      .mockResolvedValueOnce(journey as any)
      .mockResolvedValueOnce(duplicate as any)
    prismaMock.block.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(duplicate as any)

    const result = (await authClient({
      document: JOURNEY_DUPLICATE,
      variables: { id: 'journeyId', teamId: 'teamId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(prismaMock.journey.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Embed',
        slug: 'embed-duplicateJourneyId'
      })
    })
  })
})
