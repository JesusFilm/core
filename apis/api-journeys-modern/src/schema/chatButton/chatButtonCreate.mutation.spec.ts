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

describe('chatButtonCreate', () => {
  const mockUser = {
    id: 'userId',
    firstName: 'Test',
    emailVerified: true
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CHAT_BUTTON_CREATE = graphql(`
    mutation ChatButtonCreate($journeyId: ID!, $input: ChatButtonCreateInput) {
      chatButtonCreate(journeyId: $journeyId, input: $input) {
        id
        link
        platform
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

  it('creates a chat button when authorized', async () => {
    prismaMock.chatButton.findMany.mockResolvedValue([])
    prismaMock.chatButton.create.mockResolvedValue({
      id: 'chatButtonId',
      journeyId: 'journeyId',
      link: 'https://m.me/user',
      platform: 'facebook',
      customizable: null
    } as any)

    const result = await authClient({
      document: CHAT_BUTTON_CREATE,
      variables: {
        journeyId: 'journeyId',
        input: { link: 'https://m.me/user', platform: 'facebook' as any }
      }
    })

    expect(result).toEqual({
      data: {
        chatButtonCreate: {
          id: 'chatButtonId',
          link: 'https://m.me/user',
          platform: 'facebook'
        }
      }
    })

    expect(prismaMock.chatButton.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          journeyId: 'journeyId',
          link: 'https://m.me/user',
          platform: 'facebook'
        }
      })
    )
  })

  it('creates a chat button with null input', async () => {
    prismaMock.chatButton.findMany.mockResolvedValue([])
    prismaMock.chatButton.create.mockResolvedValue({
      id: 'chatButtonId',
      journeyId: 'journeyId',
      link: null,
      platform: null,
      customizable: null
    } as any)

    const result = await authClient({
      document: CHAT_BUTTON_CREATE,
      variables: {
        journeyId: 'journeyId'
      }
    })

    expect(result).toEqual({
      data: {
        chatButtonCreate: {
          id: 'chatButtonId',
          link: null,
          platform: null
        }
      }
    })
  })

  it('throws error when journey already has 2 chat buttons', async () => {
    prismaMock.chatButton.findMany.mockResolvedValue([
      { id: '1' },
      { id: '2' }
    ] as any)

    const result = await authClient({
      document: CHAT_BUTTON_CREATE,
      variables: {
        journeyId: 'journeyId',
        input: { link: 'https://m.me/user', platform: 'facebook' as any }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message:
            'There are already 2 chat buttons associated with the given journey'
        })
      ]
    })

    expect(prismaMock.chatButton.create).not.toHaveBeenCalled()
  })

  it('throws error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: CHAT_BUTTON_CREATE,
      variables: {
        journeyId: 'journeyId',
        input: { link: 'https://m.me/user', platform: 'facebook' as any }
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
