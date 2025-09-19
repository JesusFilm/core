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
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'blockId',
      journeyId: 'journeyId',
      deletedAt: null
    } as any)
    ;(prismaMock.block.findFirst as unknown as jest.Mock).mockImplementation(
      (args: any) => {
        const queriedId = args?.where?.id
        if (queriedId === 'blockId') {
          return Promise.resolve({
            id: 'blockId',
            parentBlockId: 'stepId',
            journeyId: 'journeyId',
            deletedAt: null
          } as any)
        }
        if (queriedId === 'stepId') {
          return Promise.resolve({
            id: 'stepId',
            journeyId: 'journeyId',
            deletedAt: null
          } as any)
        }
        return Promise.resolve(null as any)
      }
    )
    prismaMock.visitor.findFirst.mockResolvedValue({ id: 'visitorId' } as any)
    prismaMock.journeyVisitor.upsert.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      activityCount: 0
    } as any)
  })

  it('creates ChatOpenEvent', async () => {
    const input = {
      id: 'evt-2',
      blockId: 'blockId',
      stepId: 'stepId',
      value: 'facebook' as const
    }

    const createdEvent = {
      id: input.id,
      typename: 'ChatOpenEvent',
      journeyId: 'journeyId',
      value: input.value,
      createdAt: new Date()
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)

    prismaMock.visitor.update.mockResolvedValue({ id: 'visitorId' } as any)
    prismaMock.journeyVisitor.update.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)

    const result = await authClient({
      document: CHAT_OPEN_EVENT_CREATE,
      variables: { input }
    })

    expect(prismaMock.event.create).toHaveBeenCalled()
    const createArgs = (prismaMock.event.create as unknown as jest.Mock).mock
      .calls[0][0]
    expect(createArgs).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.id,
          typename: 'ChatOpenEvent',
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.value
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
