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

describe('blockOrderUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BLOCK_ORDER_UPDATE = graphql(`
    mutation BlockOrderUpdate($id: ID!, $parentOrder: Int!) {
      blockOrderUpdate(id: $id, parentOrder: $parentOrder) {
        id
        parentOrder
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'
  const journey = { id: 'journeyId' }
  const block = {
    id,
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 0,
    journey
  }

  const sibling = {
    id: 'siblingId',
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reorders the block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        findMany: jest.fn().mockResolvedValue([sibling]),
        update: jest
          .fn()
          .mockResolvedValueOnce({ ...sibling, parentOrder: 0 })
          .mockResolvedValueOnce({ ...block, parentOrder: 1 })
      },
      journey: { update: jest.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: BLOCK_ORDER_UPDATE,
      variables: { id, parentOrder: 1 }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: journey },
      expect.any(Object)
    )
    expect(tx.block.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: { not: null },
          deletedAt: null,
          id: { not: id }
        })
      })
    )
    expect(tx.block.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'siblingId' },
      data: { parentOrder: 0 },
      include: { action: true }
    })
    expect(tx.block.update).toHaveBeenNthCalledWith(2, {
      where: { id },
      data: { parentOrder: 1 },
      include: { action: true }
    })
    expect(tx.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { updatedAt: expect.any(String) }
    })

    expect(result).toEqual({
      data: {
        blockOrderUpdate: [
          { id: 'siblingId', parentOrder: 0 },
          { id, parentOrder: 1 }
        ]
      }
    })
  })

  it('returns empty array when block has no parentOrder', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({ ...block, parentOrder: null })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        findMany: jest.fn(),
        update: jest.fn()
      },
      journey: { update: jest.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: BLOCK_ORDER_UPDATE,
      variables: { id, parentOrder: 1 }
    })

    expect(tx.block.findMany).not.toHaveBeenCalled()
    expect(tx.block.update).not.toHaveBeenCalled()
    expect(tx.journey.update).toHaveBeenCalled()
    expect(result).toEqual({
      data: { blockOrderUpdate: [] }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: BLOCK_ORDER_UPDATE,
      variables: { id, parentOrder: 1 }
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
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    const { GraphQLError } = require('graphql')
    fetchBlockWithJourneyAcl.mockRejectedValue(
      new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = await authClient({
      document: BLOCK_ORDER_UPDATE,
      variables: { id, parentOrder: 1 }
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
