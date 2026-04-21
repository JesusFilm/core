import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: jest.fn()
}))

jest.mock(
  '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable',
  () => ({
    recalculateJourneyCustomizable: jest.fn()
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

  const {
    fetchBlockWithJourneyAcl
  } = require('../../lib/auth/fetchBlockWithJourneyAcl')
  const {
    recalculateJourneyCustomizable
  } = require('../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'
  const journey = { id: 'journeyId' }
  const block = {
    id,
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 0,
    action: null,
    journey
  }

  const duplicatedBlock = {
    id: 'duplicatedBlockId',
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 1,
    action: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('duplicates the block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    prismaMock.block.findUnique.mockResolvedValue(block as any)
    prismaMock.block.findMany.mockResolvedValueOnce([])
    prismaMock.block.create.mockResolvedValue(duplicatedBlock as any)
    prismaMock.block.findMany.mockResolvedValue([
      block as any,
      duplicatedBlock as any
    ])
    prismaMock.block.update
      .mockResolvedValueOnce({ ...block, parentOrder: 0 } as any)
      .mockResolvedValueOnce({ ...duplicatedBlock, parentOrder: 1 } as any)

    const tx = {
      journey: { update: jest.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
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
  })

  it('duplicates with custom idMap', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    const customBlock = {
      ...block,
      settings: {},
      action: null
    }

    prismaMock.block.findUnique.mockResolvedValue(customBlock as any)
    prismaMock.block.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValue([customBlock as any, { ...duplicatedBlock, id: 'customNewId' } as any])
    prismaMock.block.create.mockResolvedValue({
      ...duplicatedBlock,
      id: 'customNewId'
    } as any)
    prismaMock.block.update.mockImplementation((async (args: any) => ({
      ...duplicatedBlock,
      id: args.where.id,
      parentOrder: args.data.parentOrder ?? 0
    })) as any)

    const tx = {
      journey: { update: jest.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const idMap = [{ oldId: 'blockId', newId: 'customNewId' }]

    await authClient({
      document: BLOCK_DUPLICATE,
      variables: { id, parentOrder: 1, idMap }
    })

    expect(recalculateJourneyCustomizable).toHaveBeenCalledWith('journeyId')
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
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

  it('returns NOT_FOUND when block does not exist', async () => {
    const { GraphQLError } = require('graphql')
    fetchBlockWithJourneyAcl.mockRejectedValue(
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
