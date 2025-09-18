import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('buttonClickEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BUTTON_CLICK_EVENT_CREATE = graphql(`
    mutation ButtonClickEventCreate($input: ButtonClickEventCreateInput!) {
      buttonClickEventCreate(input: $input) {
        id
        journeyId
        label
        value
        action
        actionValue
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

  it('creates ButtonClickEvent', async () => {
    const input = {
      id: 'evt-1',
      blockId: 'blockId',
      stepId: 'stepId',
      label: 'Step 1',
      value: 'Button Label',
      action: 'LinkAction' as const,
      actionValue: 'https://example.com'
    }

    prismaMock.event.create.mockResolvedValue({
      id: input.id,
      typename: 'ButtonClickEvent',
      journeyId: 'journeyId',
      label: input.label,
      value: input.value,
      action: input.action,
      actionValue: input.actionValue,
      createdAt: new Date()
    } as any)

    const result = await authClient({
      document: BUTTON_CLICK_EVENT_CREATE,
      variables: { input }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: input.id,
          typename: 'ButtonClickEvent',
          journeyId: 'journeyId',
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          action: input.action,
          actionValue: input.actionValue,
          visitorId: 'visitorId'
        })
      })
    )

    expect(result).toEqual({
      data: {
        buttonClickEventCreate: expect.objectContaining({
          id: input.id,
          journeyId: 'journeyId',
          label: input.label,
          value: input.value,
          action: input.action,
          actionValue: input.actionValue
        })
      }
    })
  })
})
