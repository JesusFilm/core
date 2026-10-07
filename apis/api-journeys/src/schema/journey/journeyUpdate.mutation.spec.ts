import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
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

const JOURNEY_UPDATE = graphql(`
  mutation JourneyUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
    }
  }
`)

describe('journeyUpdate', () => {
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
  })

  it('rejects a reserved slug as BAD_USER_INPUT without writing', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journeyId',
      teamId: 'teamId',
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [
          { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
        ]
      }
    } as any)

    const result = (await authClient({
      document: JOURNEY_UPDATE,
      variables: { id: 'journeyId', input: { slug: 'template-gallery' } }
    })) as any

    expect(result.errors?.[0]).toMatchObject({
      message: 'slug is reserved',
      extensions: { code: 'BAD_USER_INPUT' }
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })
})
