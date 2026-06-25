import { GraphQLError } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'

vi.mock('../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: vi.fn()
}))

vi.mock(
  '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable',
  () => ({
    recalculateJourneyCustomizable: vi.fn()
  })
)

describe('blockDuplicate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BLOCK_DUPLICATE = graphql(`
    mutation BlockDuplicate(
      $id: ID!
      $parentOrder: Int
      $idMap: [BlockDuplicateIdMap!]
      $x: Int
      $y: Int
    ) {
      blockDuplicate(
        id: $id
        parentOrder: $parentOrder
        idMap: $idMap
        x: $x
        y: $y
      ) {
        id
        journeyId
        parentBlockId
        parentOrder
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const id = 'blockId'
  const journey = { id: 'journeyId' }
  const block = {
    id,
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 0,
    action: null,
    settings: {},
    journey
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('duplicates the block when authorized and returns response fields', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    prismaMock.block.findUnique.mockResolvedValue(block as any)
    prismaMock.block.findMany.mockResolvedValueOnce([]).mockResolvedValue([
      { ...block, parentOrder: 0 } as any,
      {
        id: 'duplicatedBlockId',
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: 1,
        action: null
      } as any
    ])
    prismaMock.block.create.mockResolvedValue({
      id: 'duplicatedBlockId',
      typename: 'ImageBlock',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      parentOrder: null,
      action: null
    } as any)
    prismaMock.block.update
      .mockResolvedValueOnce({
        id: 'duplicatedBlockId',
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: null,
        action: null
      } as any)
      .mockResolvedValueOnce({
        id,
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: 0,
        action: null
      } as any)
      .mockResolvedValueOnce({
        id: 'duplicatedBlockId',
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: 1,
        action: null
      } as any)

    const tx = {
      journey: { update: vi.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id, parentOrder: 1 }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: journey },
      expect.any(Object)
    )
    expect(tx.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { updatedAt: expect.any(String) }
    })
    expect(recalculateJourneyCustomizable).toHaveBeenCalledWith('journeyId')
    expect(result).toEqual({
      data: {
        blockDuplicate: [
          {
            id,
            journeyId: 'journeyId',
            parentBlockId: 'parentId',
            parentOrder: 0
          },
          {
            id: 'duplicatedBlockId',
            journeyId: 'journeyId',
            parentBlockId: 'parentId',
            parentOrder: 1
          }
        ]
      }
    })
  })

  it('duplicates with custom idMap and returns the mapped id', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    prismaMock.block.findUnique.mockResolvedValue(block as any)
    prismaMock.block.findMany.mockResolvedValueOnce([]).mockResolvedValue([
      { ...block, parentOrder: 0 } as any,
      {
        id: 'customNewId',
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: 1,
        action: null
      } as any
    ])
    prismaMock.block.create.mockResolvedValue({
      id: 'customNewId',
      typename: 'ImageBlock',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      parentOrder: null,
      action: null
    } as any)
    prismaMock.block.update
      .mockResolvedValueOnce({
        id: 'customNewId',
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: null,
        action: null
      } as any)
      .mockResolvedValueOnce({
        id,
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: 0,
        action: null
      } as any)
      .mockResolvedValueOnce({
        id: 'customNewId',
        typename: 'ImageBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        parentOrder: 1,
        action: null
      } as any)

    const tx = {
      journey: { update: vi.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const idMap = [{ oldId: 'blockId', newId: 'customNewId' }]

    const result = await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id, parentOrder: 1, idMap }
    })

    expect(recalculateJourneyCustomizable).toHaveBeenCalledWith('journeyId')
    expect(result).toEqual({
      data: {
        blockDuplicate: [
          {
            id,
            journeyId: 'journeyId',
            parentBlockId: 'parentId',
            parentOrder: 0
          },
          {
            id: 'customNewId',
            journeyId: 'journeyId',
            parentBlockId: 'parentId',
            parentOrder: 1
          }
        ]
      }
    })
  })

  it('duplicates a StepBlock with x and y coordinates', async () => {
    const stepBlock = {
      ...block,
      id: 'stepBlockId',
      typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      x: 100,
      y: 200
    }

    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(stepBlock)
    mockAbility.mockReturnValue(true)

    prismaMock.block.findUnique.mockResolvedValue(stepBlock as any)
    prismaMock.block.findMany.mockResolvedValueOnce([]).mockResolvedValue([
      { ...stepBlock, parentOrder: 0 } as any,
      {
        id: 'duplicatedStepId',
        typename: 'StepBlock',
        journeyId: 'journeyId',
        parentBlockId: null,
        parentOrder: 1,
        x: 300,
        y: 400,
        action: null
      } as any
    ])
    prismaMock.block.create.mockResolvedValue({
      id: 'duplicatedStepId',
      typename: 'StepBlock',
      journeyId: 'journeyId',
      parentBlockId: null,
      parentOrder: null,
      x: 100,
      y: 200,
      action: null
    } as any)
    prismaMock.block.update
      .mockResolvedValueOnce({
        id: 'duplicatedStepId',
        typename: 'StepBlock',
        journeyId: 'journeyId',
        parentBlockId: null,
        parentOrder: null,
        x: 300,
        y: 400,
        action: null
      } as any)
      .mockResolvedValueOnce({
        id: 'stepBlockId',
        typename: 'StepBlock',
        journeyId: 'journeyId',
        parentBlockId: null,
        parentOrder: 0,
        x: 100,
        y: 200,
        action: null
      } as any)
      .mockResolvedValueOnce({
        id: 'duplicatedStepId',
        typename: 'StepBlock',
        journeyId: 'journeyId',
        parentBlockId: null,
        parentOrder: 1,
        x: 300,
        y: 400,
        action: null
      } as any)

    const tx = {
      journey: { update: vi.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const idMap = [{ oldId: 'stepBlockId', newId: 'duplicatedStepId' }]

    const result = await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id: 'stepBlockId', parentOrder: 1, x: 300, y: 400, idMap }
    })

    expect(prismaMock.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'duplicatedStepId' },
        data: expect.objectContaining({ x: 300, y: 400 })
      })
    )
    expect(recalculateJourneyCustomizable).toHaveBeenCalledWith('journeyId')
    expect(result).toEqual({
      data: {
        blockDuplicate: [
          {
            id: 'stepBlockId',
            journeyId: 'journeyId',
            parentBlockId: null,
            parentOrder: 0
          },
          {
            id: 'duplicatedStepId',
            journeyId: 'journeyId',
            parentBlockId: null,
            parentOrder: 1
          }
        ]
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(block)
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update block'
        })
      ]
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(recalculateJourneyCustomizable).not.toHaveBeenCalled()
  })

  it('preserves per-card showAssistant and expandChatByDefault when duplicating a CardBlock', async () => {
    const cardBlock = {
      id: 'cardBlockId',
      typename: 'CardBlock',
      journeyId: 'journeyId',
      parentBlockId: 'stepId',
      parentOrder: 0,
      backgroundColor: '#FFF',
      fullscreen: false,
      themeMode: null,
      themeName: null,
      showAssistant: true,
      expandChatByDefault: false,
      action: null,
      settings: {},
      journey
    }

    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(cardBlock)
    mockAbility.mockReturnValue(true)

    prismaMock.block.findUnique.mockResolvedValue(cardBlock as any)
    prismaMock.block.findMany.mockResolvedValueOnce([]).mockResolvedValue([
      { ...cardBlock, parentOrder: 0 } as any,
      {
        ...cardBlock,
        id: 'duplicatedCardId',
        parentOrder: 1
      } as any
    ])
    prismaMock.block.create.mockResolvedValue({
      ...cardBlock,
      id: 'duplicatedCardId',
      parentOrder: null
    } as any)
    prismaMock.block.update
      .mockResolvedValueOnce({
        ...cardBlock,
        id: 'duplicatedCardId',
        parentOrder: null
      } as any)
      .mockResolvedValueOnce({ ...cardBlock, parentOrder: 0 } as any)
      .mockResolvedValueOnce({
        ...cardBlock,
        id: 'duplicatedCardId',
        parentOrder: 1
      } as any)

    const tx = {
      journey: { update: vi.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id: 'cardBlockId', parentOrder: 1 }
    })

    expect(prismaMock.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          showAssistant: true,
          expandChatByDefault: false
        })
      })
    )
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockRejectedValue(
      new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'block not found'
        })
      ]
    })
  })
})
