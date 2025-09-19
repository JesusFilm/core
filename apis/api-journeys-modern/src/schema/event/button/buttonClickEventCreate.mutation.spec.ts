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

    const createdEvent = {
      id: input.id,
      typename: 'ButtonClickEvent',
      journeyId: 'journeyId',
      label: input.label,
      value: input.value,
      action: input.action,
      actionValue: input.actionValue,
      createdAt: new Date()
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)

    // Pothos Prisma may try to batch-load via findMany or fallback to findUnique / findUniqueOrThrow
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    // Some versions will use findUniqueOrThrow when present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)

    // Background updates (not asserted) should resolve
    prismaMock.visitor.update.mockResolvedValue({ id: 'visitorId' } as any)
    prismaMock.journeyVisitor.update.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
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

    // Asserts background updates use atomic increment and set lastLinkAction
    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityCount: { increment: 1 },
          lastLinkAction: input.actionValue
        })
      })
    )
    expect(prismaMock.visitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastLinkAction: input.actionValue })
      })
    )
  })

  it('does not write lastLinkAction when actionValue is undefined (LinkAction)', async () => {
    const input = {
      id: 'evt-2',
      blockId: 'blockId',
      stepId: 'stepId',
      label: 'Step 1',
      value: 'Button Label',
      action: 'LinkAction' as const,
      actionValue: undefined
    }

    const createdEvent = {
      id: input.id,
      typename: 'ButtonClickEvent',
      journeyId: 'journeyId',
      label: input.label,
      value: input.value,
      action: input.action,
      actionValue: input.actionValue,
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
      document: BUTTON_CLICK_EVENT_CREATE,
      variables: { input }
    })

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          buttonClickEventCreate: expect.objectContaining({ id: input.id })
        }
      })
    )

    // Ensure lastLinkAction is not present in updates when undefined
    expect(prismaMock.visitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          // anything() would match even undefined; we assert property absence
          lastLinkAction: expect.anything()
        })
      })
    )
    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ activityCount: { increment: 1 } })
      })
    )
    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          lastLinkAction: expect.anything()
        })
      })
    )
  })

  it('increments activity for EmailAction without writing lastLinkAction', async () => {
    const input = {
      id: 'evt-3',
      blockId: 'blockId',
      stepId: 'stepId',
      label: 'Step 1',
      value: 'Button Label',
      action: 'EmailAction' as const
    }

    const createdEvent = {
      id: input.id,
      typename: 'ButtonClickEvent',
      journeyId: 'journeyId',
      label: input.label,
      value: input.value,
      action: input.action,
      createdAt: new Date()
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)

    prismaMock.journeyVisitor.update.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)

    const result = await authClient({
      document: BUTTON_CLICK_EVENT_CREATE,
      variables: { input }
    })

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          buttonClickEventCreate: expect.objectContaining({ id: input.id })
        }
      })
    )

    // visitor.update should not be called for EmailAction
    expect(prismaMock.visitor.update).not.toHaveBeenCalled()
    // journeyVisitor.update increments activityCount and does not set lastLinkAction
    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ activityCount: { increment: 1 } })
      })
    )
    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          lastLinkAction: expect.anything()
        })
      })
    )
  })
})
