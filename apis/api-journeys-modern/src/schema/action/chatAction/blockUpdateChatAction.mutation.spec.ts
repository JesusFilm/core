import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('blockUpdateChatAction mutation', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'testUserId' } }
  })

  const MUTATION = graphql(`
    mutation BlockUpdateChatAction($id: ID!, $input: ChatActionInput!) {
      blockUpdateChatAction(id: $id, input: $input) {
        __typename
        url
        target
        gtmEventName
        chatPlatform
      }
    }
  `)

  const journeyWithAccess = {
    id: 'journeyId',
    template: false,
    status: 'published',
    userJourneys: [],
    team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] }
  } as any

  const actionableBlock = {
    id: '1',
    typename: 'RadioOptionBlock',
    parentBlockId: 'parent-step-id',
    journey: journeyWithAccess,
    action: null
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('success', () => {
    it('creates or updates chat action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://wa.me/1234567890',
        target: null,
        chatPlatform: 'whatsApp'
      } as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: {
            gtmEventName: null,
            url: 'https://wa.me/1234567890',
            target: null,
            chatPlatform: 'whatsApp'
          }
        }
      })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          url: 'https://wa.me/1234567890',
          target: null,
          chatPlatform: 'whatsApp',
          parentBlock: { connect: { id: '1' } }
        },
        update: {
          email: null,
          phone: null,
          journey: { disconnect: true },
          block: { disconnect: true },
          gtmEventName: null,
          url: 'https://wa.me/1234567890',
          target: null,
          chatPlatform: 'whatsApp'
        }
      })

      expect(result).toEqual({
        data: {
          blockUpdateChatAction: {
            __typename: 'ChatAction',
            url: 'https://wa.me/1234567890',
            target: null,
            gtmEventName: null,
            chatPlatform: 'whatsApp'
          }
        }
      })
    })

    it('creates chat action with telegram platform', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://t.me/username',
        target: null,
        chatPlatform: 'telegram'
      } as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: {
            gtmEventName: null,
            url: 'https://t.me/username',
            target: null,
            chatPlatform: 'telegram'
          }
        }
      })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          url: 'https://t.me/username',
          target: null,
          chatPlatform: 'telegram',
          parentBlock: { connect: { id: '1' } }
        },
        update: {
          email: null,
          phone: null,
          journey: { disconnect: true },
          block: { disconnect: true },
          gtmEventName: null,
          url: 'https://t.me/username',
          target: null,
          chatPlatform: 'telegram'
        }
      })

      expect(result).toEqual({
        data: {
          blockUpdateChatAction: {
            __typename: 'ChatAction',
            url: 'https://t.me/username',
            target: null,
            gtmEventName: null,
            chatPlatform: 'telegram'
          }
        }
      })
    })
  })

  describe('errors', () => {
    it('returns error if block not found', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(null as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: 'missing',
          input: {
            gtmEventName: null,
            url: 'https://wa.me/1234567890',
            target: null,
            chatPlatform: 'whatsApp'
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [expect.objectContaining({ message: 'block not found' })]
      })
    })

    it('returns error if not authorized', async () => {
      const noAccessBlock = {
        ...actionableBlock,
        journey: { ...journeyWithAccess, team: { userTeams: [] } }
      }
      prismaMock.block.findUnique.mockResolvedValueOnce(noAccessBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: noAccessBlock.id,
          input: {
            gtmEventName: null,
            url: 'https://wa.me/1234567890',
            target: null,
            chatPlatform: 'whatsApp'
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'user is not allowed to update block'
          })
        ]
      })
    })

    it('returns error if block does not support chat actions', async () => {
      const wrongBlock = { ...actionableBlock, typename: 'ImageBlock' }
      prismaMock.block.findUnique.mockResolvedValueOnce(wrongBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: wrongBlock.id,
          input: {
            gtmEventName: null,
            url: 'https://wa.me/1234567890',
            target: null,
            chatPlatform: 'whatsApp'
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'This block does not support chat actions'
          })
        ]
      })
    })
  })
})
