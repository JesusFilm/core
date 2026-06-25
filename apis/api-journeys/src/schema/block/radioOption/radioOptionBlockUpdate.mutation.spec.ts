import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: vi.fn()
}))

describe('radioOptionBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const RADIO_OPTION_BLOCK_UPDATE = graphql(`
    mutation RadioOptionBlockUpdate(
      $id: ID!
      $input: RadioOptionBlockUpdateInput!
    ) {
      radioOptionBlockUpdate(id: $id, input: $input) {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates radio option block when authorized', async () => {
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
          typename: 'RadioOptionBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          label: 'Updated Option'
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: RADIO_OPTION_BLOCK_UPDATE,
      variables: {
        id,
        input: { label: 'Updated Option' }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          label: 'Updated Option'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        radioOptionBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          label: 'Updated Option'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: RADIO_OPTION_BLOCK_UPDATE,
      variables: {
        id,
        input: { label: 'Updated Option' }
      }
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

  it('updates with partial input fields', async () => {
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
          typename: 'RadioOptionBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 1,
          label: 'Only label',
          eventLabel: null,
          pollOptionImageBlockId: null
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: RADIO_OPTION_BLOCK_UPDATE,
      variables: {
        id,
        input: { label: 'Only label' }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          label: 'Only label'
        })
      })
    )

    expect(result).toEqual({
      data: {
        radioOptionBlockUpdate: expect.objectContaining({
          id,
          label: 'Only label'
        })
      }
    })
  })
})
