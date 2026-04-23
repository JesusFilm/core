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

const mockRecalculate =
  recalculateJourneyCustomizable as jest.MockedFunction<
    typeof recalculateJourneyCustomizable
  >

describe('chatButtonUpdate', () => {
  const mockUser = {
    id: 'userId',
    firstName: 'Test',
    emailVerified: true
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CHAT_BUTTON_UPDATE = graphql(`
    mutation ChatButtonUpdate(
      $id: ID!
      $journeyId: ID!
      $input: ChatButtonUpdateInput!
    ) {
      chatButtonUpdate(id: $id, journeyId: $journeyId, input: $input) {
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

  it('updates a chat button when authorized', async () => {
    prismaMock.chatButton.update.mockResolvedValue({
      id: 'chatButtonId',
      journeyId: 'journeyId',
      link: 'https://m.me/updated',
      platform: 'facebook',
      customizable: true
    } as any)

    const result = await authClient({
      document: CHAT_BUTTON_UPDATE,
      variables: {
        id: 'chatButtonId',
        journeyId: 'journeyId',
        input: {
          link: 'https://m.me/updated',
          platform: 'facebook' as any,
          customizable: true
        }
      }
    })

    expect(result).toEqual({
      data: {
        chatButtonUpdate: {
          id: 'chatButtonId',
          link: 'https://m.me/updated',
          platform: 'facebook',
          customizable: true
        }
      }
    })

    expect(prismaMock.chatButton.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'chatButtonId' },
        data: {
          journeyId: 'journeyId',
          link: 'https://m.me/updated',
          platform: 'facebook',
          customizable: true
        }
      })
    )

    expect(mockRecalculate).toHaveBeenCalledWith('journeyId')
  })

  it('updates a chat button with partial input', async () => {
    prismaMock.chatButton.update.mockResolvedValue({
      id: 'chatButtonId',
      journeyId: 'journeyId',
      link: 'https://wa.me/updated',
      platform: 'whatsApp',
      customizable: null
    } as any)

    const result = await authClient({
      document: CHAT_BUTTON_UPDATE,
      variables: {
        id: 'chatButtonId',
        journeyId: 'journeyId',
        input: {
          link: 'https://wa.me/updated'
        }
      }
    })

    expect(result).toEqual({
      data: {
        chatButtonUpdate: {
          id: 'chatButtonId',
          link: 'https://wa.me/updated',
          platform: 'whatsApp',
          customizable: null
        }
      }
    })
  })

  it('throws error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: CHAT_BUTTON_UPDATE,
      variables: {
        id: 'chatButtonId',
        journeyId: 'journeyId',
        input: {
          link: 'https://m.me/updated'
        }
      }
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
