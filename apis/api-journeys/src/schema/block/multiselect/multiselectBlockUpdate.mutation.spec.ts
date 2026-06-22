import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { recalculateJourneyCustomizable } from '../../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'

vi.mock(
  '../../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
)

vi.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: vi.fn()
}))

describe('multiselectBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MULTISELECT_BLOCK_UPDATE = graphql(`
    mutation MultiselectBlockUpdate(
      $id: ID!
      $input: MultiselectBlockUpdateInput!
    ) {
      multiselectBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        min
        max
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const id = 'blockId'
  const input = {
    parentBlockId: 'parentId',
    min: 0,
    max: 5
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findUnique.mockResolvedValue({
      id,
      typename: 'MultiselectBlock',
      journeyId: 'journeyId',
      parentBlockId: input.parentBlockId,
      min: input.min,
      max: input.max
    } as any)
  })

  it('updates multiselect block when authorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'MultiselectBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: input.min,
          max: input.max
        })
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input }
    })

    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id } })
    )
    expect(tx.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId' }
      })
    )

    expect(recalculateJourneyCustomizable).toHaveBeenCalledWith('journeyId')

    expect(result).toEqual({
      data: {
        multiselectBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId'
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input }
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

  it('fails when min is negative', async () => {
    // authorize so validation runs
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: -1 } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'min must be greater than or equal to 0',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
        })
      ]
    })
  })

  it('fails when max is negative', async () => {
    // authorize so validation runs
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { max: -2 } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'max must be greater than or equal to 0',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
        })
      ]
    })
  })

  it('fails when min is greater than max', async () => {
    // authorize so validation runs
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: 5, max: 3 } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'min must be less than or equal to max',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
        })
      ]
    })
  })

  it('preserves existing max when omitted in input', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockImplementation(async (args) => ({
          id,
          typename: 'MultiselectBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          // existing max from DB should be preserved; we simulate it remains 5
          min: 0,
          max: 5
        }))
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: 0 } }
    })

    // ensure we didn't send max in the update payload when omitted
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ max: expect.anything() })
      })
    )
    expect(result).toEqual({
      data: {
        multiselectBlockUpdate: expect.objectContaining({ max: 5 })
      }
    })
  })

  it('preserves min/max when equal to child count on update', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'MultiselectBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: 4,
          max: 4
        })
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    // mock option count
    prismaMock.block.count.mockResolvedValue(4 as any)

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: 4, max: 4 } }
    })

    expect(prismaMock.block.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ parentBlockId: id })
      })
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ min: 4, max: 4 })
      })
    )
    expect(result).toEqual({
      data: {
        multiselectBlockUpdate: expect.objectContaining({
          min: 4,
          max: 4
        })
      }
    })
  })
})
