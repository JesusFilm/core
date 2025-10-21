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
        chatUrl
        gtmEventName
        target
        customizable
        parentStepId
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
    typename: 'ButtonBlock',
    journey: journeyWithAccess,
    action: null
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a new chat action', async () => {
    prismaMock.block.findUnique.mockResolvedValueOnce(actionableBlock)

    prismaMock.action.upsert.mockResolvedValueOnce({
      parentBlockId: '1',
      gtmEventName: null,
      chatUrl: 'https://wa.me/1234567890',
      target: null,
      customizable: true,
      parentStepId: null
    } as any)

    const variables = {
      id: actionableBlock.id,
      input: {
        gtmEventName: null,
        chatUrl: 'https://wa.me/1234567890',
        target: null,
        customizable: true,
        parentStepId: null
      }
    }

    const result = await authClient({ document: MUTATION, variables })

    expect(prismaMock.action.upsert).toHaveBeenCalledWith({
      where: { parentBlockId: '1' },
      create: {
        gtmEventName: null,
        chatUrl: 'https://wa.me/1234567890',
        target: null,
        customizable: true,
        parentStepId: null,
        parentBlock: { connect: { id: '1' } }
      },
      update: {
        url: null,
        email: null,
        phone: null,
        journey: { disconnect: true },
        block: { disconnect: true },
        gtmEventName: null,
        chatUrl: 'https://wa.me/1234567890',
        target: null,
        customizable: true,
        parentStepId: null
      }
    })

    expect(result).toEqual({
      data: {
        blockUpdateChatAction: {
          chatUrl: 'https://wa.me/1234567890',
          gtmEventName: null,
          target: null,
          customizable: true,
          parentStepId: null
        }
      }
    })
  })

  it('updates an existing chat action', async () => {
    const blockWithAction = {
      ...actionableBlock,
      action: {
        parentBlockId: '1',
        chatUrl: 'https://wa.me/1234567890',
        gtmEventName: null,
        target: null
      }
    }

    prismaMock.block.findUnique.mockResolvedValueOnce(blockWithAction)

    prismaMock.action.upsert.mockResolvedValueOnce({
      parentBlockId: '1',
      gtmEventName: 'updated-event',
      chatUrl: 'https://wa.me/9876543210',
      target: '_blank',
      customizable: false,
      parentStepId: 'step-123'
    } as any)

    const variables = {
      id: actionableBlock.id,
      input: {
        gtmEventName: 'updated-event',
        chatUrl: 'https://wa.me/9876543210',
        target: '_blank',
        customizable: false,
        parentStepId: 'step-123'
      }
    }

    const result = await authClient({ document: MUTATION, variables })

    expect(prismaMock.action.upsert).toHaveBeenCalledWith({
      where: { parentBlockId: '1' },
      create: {
        gtmEventName: 'updated-event',
        chatUrl: 'https://wa.me/9876543210',
        target: '_blank',
        customizable: false,
        parentStepId: 'step-123',
        parentBlock: { connect: { id: '1' } }
      },
      update: {
        url: null,
        email: null,
        phone: null,
        journey: { disconnect: true },
        block: { disconnect: true },
        gtmEventName: 'updated-event',
        chatUrl: 'https://wa.me/9876543210',
        target: '_blank',
        customizable: false,
        parentStepId: 'step-123'
      }
    })

    expect(result).toEqual({
      data: {
        blockUpdateChatAction: {
          chatUrl: 'https://wa.me/9876543210',
          gtmEventName: 'updated-event',
          target: '_blank',
          customizable: false,
          parentStepId: 'step-123'
        }
      }
    })
  })
})
