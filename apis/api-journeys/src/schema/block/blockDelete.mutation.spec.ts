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

describe('blockDelete', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BLOCK_DELETE = graphql(`
    mutation BlockDelete($id: ID!) {
      blockDelete(id: $id) {
        id
        parentOrder
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>
  const mockRecalculate = recalculateJourneyCustomizable as MockedFunction<
    typeof recalculateJourneyCustomizable
  >

  const id = 'blockId'
  const journey = { id: 'journeyId' }
  const block = {
    id,
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 1,
    journey
  }

  const sibling = {
    id: 'siblingId',
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 0,
    action: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes block and returns reordered siblings when authorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    const reorderedSibling = { ...sibling, parentOrder: 0 }

    const tx = {
      block: {
        update: vi
          .fn()
          .mockResolvedValueOnce({
            ...block,
            deletedAt: new Date().toISOString()
          })
          .mockResolvedValueOnce(reorderedSibling),
        findMany: vi.fn().mockResolvedValue([sibling])
      },
      journey: { update: vi.fn().mockResolvedValue(journey) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: BLOCK_DELETE,
      variables: { id }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: journey },
      expect.any(Object)
    )
    expect(tx.block.update).toHaveBeenNthCalledWith(1, {
      where: { id },
      data: { deletedAt: expect.any(String) }
    })
    expect(tx.journey.update).toHaveBeenCalledWith({
      where: { id: 'journeyId' },
      data: { updatedAt: expect.any(String) }
    })
    expect(result).toEqual({
      data: {
        blockDelete: [{ id: 'siblingId', parentOrder: 0 }]
      }
    })
    expect(mockRecalculate).toHaveBeenCalledWith('journeyId')
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue(block)
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: BLOCK_DELETE,
      variables: { id }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete block'
        })
      ]
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockRejectedValue(
      new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = await authClient({
      document: BLOCK_DELETE,
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
