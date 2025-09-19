import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('chatOpenEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CHAT_OPEN_EVENT_CREATE = graphql(`
    mutation ChatOpenEventCreate($input: ChatOpenEventCreateInput!) {
      chatOpenEventCreate(input: $input) {
        id
        journeyId
        value
      }
    }
  `)

  beforeEach(() => {
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      journeyId: 'journeyId'
    } as any)
    prismaMock.visitor.findFirst.mockResolvedValue({ id: 'visitorId' } as any)
    prismaMock.journeyVisitor.findUnique.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)
  })

  it('creates ChatOpenEvent', async () => {
    const input = {
      id: 'evt-2',
      blockId: 'blockId',
      stepId: 'stepId',
      value: 'facebook' as const
    }

    prismaMock.event.create.mockResolvedValue({
      id: input.id,
      typename: 'ChatOpenEvent',
      journeyId: 'journeyId',
      value: input.value,
      createdAt: new Date()
    } as any)

    const result = await authClient({
      document: CHAT_OPEN_EVENT_CREATE,
      variables: { input }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.id,
          typename: 'ChatOpenEvent',
          journeyId: 'journeyId',
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.value,
          visitorId: 'visitorId'
        })
      })
    )

    expect(result).toEqual({
      data: {
        chatOpenEventCreate: expect.objectContaining({
          id: input.id,
          journeyId: 'journeyId',
          value: input.value
        })
      }
    })
  })
})
