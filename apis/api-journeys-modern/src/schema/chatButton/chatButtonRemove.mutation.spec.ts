import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock(
  '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable',
  () => ({
    recalculateJourneyCustomizable: jest.fn()
  })
)

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const mockRecalculate = recalculateJourneyCustomizable as jest.MockedFunction<
  typeof recalculateJourneyCustomizable
>

describe('chatButtonRemove', () => {
  const mockUser = {
    id: 'userId',
    firstName: 'Test',
    emailVerified: true
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CHAT_BUTTON_REMOVE = graphql(`
    mutation ChatButtonRemove($id: ID!) {
      chatButtonRemove(id: $id) {
        id
        link
        platform
        customizable
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('removes a chat button when authorized', async () => {
    prismaMock.chatButton.delete.mockResolvedValue({
      id: 'chatButtonId',
      journeyId: 'journeyId',
      link: 'https://m.me/user',
      platform: 'facebook',
      customizable: true
    } as any)

    const result = await authClient({
      document: CHAT_BUTTON_REMOVE,
      variables: { id: 'chatButtonId' }
    })

    expect(result).toEqual({
      data: {
        chatButtonRemove: {
          id: 'chatButtonId',
          link: 'https://m.me/user',
          platform: 'facebook',
          customizable: true
        }
      }
    })

    expect(prismaMock.chatButton.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'chatButtonId' }
      })
    )

    expect(mockRecalculate).toHaveBeenCalledWith('journeyId')
  })

  it('removes a chat button with null fields', async () => {
    prismaMock.chatButton.delete.mockResolvedValue({
      id: 'chatButtonId',
      journeyId: 'journeyId',
      link: null,
      platform: null,
      customizable: null
    } as any)

    const result = await authClient({
      document: CHAT_BUTTON_REMOVE,
      variables: { id: 'chatButtonId' }
    })

    expect(result).toEqual({
      data: {
        chatButtonRemove: {
          id: 'chatButtonId',
          link: null,
          platform: null,
          customizable: null
        }
      }
    })

    expect(mockRecalculate).toHaveBeenCalledWith('journeyId')
  })

  it('throws error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: CHAT_BUTTON_REMOVE,
      variables: { id: 'chatButtonId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })
})
