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

describe('multiselectOptionBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MULTISELECT_OPTION_BLOCK_UPDATE = graphql(`
    mutation MultiselectOptionBlockUpdate(
      $id: ID!
      $input: MultiselectOptionBlockUpdateInput!
    ) {
      multiselectOptionBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        label
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const id = 'blockId'
  const input = {
    parentBlockId: 'parentId',
    label: 'Updated option label'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findUnique.mockResolvedValue({
      id,
      typename: 'MultiselectOptionBlock',
      journeyId: 'journeyId',
      parentBlockId: input.parentBlockId,
      label: input.label
    } as any)
  })

  it('updates multiselect option block when authorized', async () => {
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
          typename: 'MultiselectOptionBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: input.label
        })
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_OPTION_BLOCK_UPDATE,
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
        multiselectOptionBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          label: input.label
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
      document: MULTISELECT_OPTION_BLOCK_UPDATE,
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
})
