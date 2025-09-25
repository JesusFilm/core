import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('blockUpdateAction mutation', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'testUserId' } }
  })

  const MUTATION = graphql(`
    mutation BlockUpdateAction($id: ID!, $input: BlockUpdateActionInput!) {
      blockUpdateAction(id: $id, input: $input) {
        __typename
        ... on LinkAction {
          url
          target
          gtmEventName
        }
        ... on EmailAction {
          email
          gtmEventName
        }
        ... on PhoneAction {
          phone
          countryCode
          gtmEventName
        }
        ... on NavigateToBlockAction {
          gtmEventName
          blockId
        }
        ... on ChatAction {
          chatUrl
          gtmEventName
          target
        }
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
    journey: journeyWithAccess
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('success cases', () => {
    it('updates a phone action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        phone: '+1555123456',
        countryCode: 'US',
        parentBlock: { id: '1', action: {} }
      } as any)

      const variables = {
        id: actionableBlock.id,
        input: { gtmEventName: null, phone: '+1555123456', countryCode: 'US' }
      }

      const result = await authClient({ document: MUTATION, variables })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } },
          phone: '+1555123456',
          countryCode: 'US'
        },
        update: expect.objectContaining({
          gtmEventName: null,
          url: null,
          target: null,
          email: null,
          journey: { disconnect: true },
          block: { disconnect: true },
          phone: '+1555123456',
          countryCode: 'US'
        })
      })

      expect(result).toEqual({
        data: {
          blockUpdateAction: {
            __typename: 'PhoneAction',
            gtmEventName: null,
            phone: '+1555123456',
            countryCode: 'US'
          }
        }
      })
    })

    it('updates a navigateToBlock action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)
      // findParentStepBlock call
      prismaMock.block.findUnique.mockResolvedValueOnce({
        id: 'different-step-id',
        typename: 'StepBlock',
        parentBlockId: null
      } as any)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        blockId: 'blockId',
        parentBlock: { id: '1', action: {} }
      } as any)

      const variables = {
        id: actionableBlock.id,
        input: { gtmEventName: null, blockId: 'blockId' }
      }

      const result = await authClient({ document: MUTATION, variables })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } },
          block: { connect: { id: 'blockId' } }
        },
        update: expect.objectContaining({
          gtmEventName: null,
          url: null,
          target: null,
          email: null,
          phone: null,
          journey: { disconnect: true },
          block: { connect: { id: 'blockId' } }
        })
      })

      expect(result).toEqual({
        data: {
          blockUpdateAction: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: null,
            blockId: 'blockId'
          }
        }
      })
    })

    it('updates a link action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        url: 'https://example.com',
        parentBlock: { id: '1', action: {} }
      } as any)

      const variables = {
        id: actionableBlock.id,
        input: { url: 'https://example.com' }
      }

      const result = await authClient({ document: MUTATION, variables })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          url: 'https://example.com',
          parentBlock: { connect: { id: '1' } }
        },
        update: expect.objectContaining({
          url: 'https://example.com',
          email: null,
          phone: null,
          chatUrl: null,
          journey: { disconnect: true },
          block: { disconnect: true }
        })
      })

      expect(result).toEqual({
        data: {
          blockUpdateAction: {
            __typename: 'LinkAction',
            gtmEventName: null,
            target: null,
            url: 'https://example.com'
          }
        }
      })
    })

    it('updates an email action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        email: 'example@example.com',
        parentBlock: { id: '1', action: {} }
      } as any)

      const variables = {
        id: actionableBlock.id,
        input: { gtmEventName: null, email: 'example@example.com' }
      }

      const result = await authClient({ document: MUTATION, variables })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } },
          email: 'example@example.com'
        },
        update: expect.objectContaining({
          gtmEventName: null,
          url: null,
          target: null,
          email: 'example@example.com',
          phone: null,
          journey: { disconnect: true },
          block: { disconnect: true }
        })
      })

      expect(result).toEqual({
        data: {
          blockUpdateAction: {
            __typename: 'EmailAction',
            gtmEventName: null,
            email: 'example@example.com'
          }
        }
      })
    })

    it('updates a chat action', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      prismaMock.action.upsert.mockResolvedValueOnce({
        parentBlockId: '1',
        gtmEventName: null,
        chatUrl: 'https://wa.me/1234567890',
        target: null,
        parentBlock: { id: '1', action: {} }
      } as any)

      const variables = {
        id: actionableBlock.id,
        input: {
          gtmEventName: null,
          chatUrl: 'https://wa.me/1234567890',
          target: null
        }
      }

      const result = await authClient({ document: MUTATION, variables })

      expect(prismaMock.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: '1' },
        create: {
          gtmEventName: null,
          chatUrl: 'https://wa.me/1234567890',
          target: null,
          parentBlock: { connect: { id: '1' } }
        },
        update: expect.objectContaining({
          gtmEventName: null,
          chatUrl: 'https://wa.me/1234567890',
          target: null,
          email: null,
          phone: null,
          journey: { disconnect: true },
          block: { disconnect: true }
        })
      })

      expect(result).toEqual({
        data: {
          blockUpdateAction: {
            __typename: 'ChatAction',
            gtmEventName: null,
            chatUrl: 'https://wa.me/1234567890',
            target: null
          }
        }
      })
    })
  })

  describe('error cases', () => {
    it('returns error for multiple action inputs provided', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: {
            gtmEventName: null,
            email: 'example@example.com',
            url: 'https://also-update-url.com',
            target: null
          }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'invalid combination of inputs provided'
          })
        ]
      })
    })

    it('returns error for no valid inputs provided', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

      const result = await authClient({
        document: MUTATION,
        variables: { id: actionableBlock.id, input: { gtmEventName: null } }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({ message: 'no valid inputs provided' })
        ]
      })
    })

    it('returns error when block not found', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(null as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: 'missing',
          input: { gtmEventName: null, email: 'example@example.com' }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [expect.objectContaining({ message: 'block not found' })]
      })
    })

    it('returns error when user is not allowed to update block', async () => {
      const noAccessBlock = {
        ...actionableBlock,
        journey: { ...journeyWithAccess, team: { userTeams: [] } }
      }
      prismaMock.block.findUnique.mockResolvedValueOnce(noAccessBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: noAccessBlock.id,
          input: { gtmEventName: null, email: 'example@example.com' }
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

    it('returns error when block does not support actions', async () => {
      const wrongBlock = { ...actionableBlock, typename: 'ImageBlock' }
      prismaMock.block.findUnique.mockResolvedValueOnce(wrongBlock)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: wrongBlock.id,
          input: { gtmEventName: null, email: 'example@example.com' }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'This block does not support actions'
          })
        ]
      })
    })

    it('returns error when navigateToBlock blockId equals parent step block id', async () => {
      prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)
      // findParentStepBlock -> StepBlock id equals provided blockId
      prismaMock.block.findUnique.mockResolvedValueOnce({
        id: 'step-1',
        typename: 'StepBlock',
        parentBlockId: null
      } as any)

      const result = await authClient({
        document: MUTATION,
        variables: {
          id: actionableBlock.id,
          input: { gtmEventName: null, blockId: 'step-1' }
        }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'blockId cannot be the parent step block id'
          })
        ]
      })
    })
  })
})
