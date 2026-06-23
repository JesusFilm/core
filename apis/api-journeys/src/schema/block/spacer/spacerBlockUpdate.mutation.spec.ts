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

describe('spacerBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const SPACER_BLOCK_UPDATE = graphql(`
    mutation SpacerBlockUpdate($id: ID!, $input: SpacerBlockUpdateInput!) {
      spacerBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on SpacerBlock {
          spacing
        }
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const id = 'blockId'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates spacer block when authorized', async () => {
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
          typename: 'SpacerBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          spacing: 200
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SPACER_BLOCK_UPDATE,
      variables: {
        id,
        input: { spacing: 200 }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          spacing: 200
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        spacerBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          spacing: 200
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
      document: SPACER_BLOCK_UPDATE,
      variables: {
        id,
        input: { spacing: 200 }
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
          typename: 'SpacerBlock',
          journeyId: 'journeyId',
          parentBlockId: 'newParentId',
          parentOrder: 0,
          spacing: null
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SPACER_BLOCK_UPDATE,
      variables: {
        id,
        input: { parentBlockId: 'newParentId' }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          parentBlockId: 'newParentId'
        })
      })
    )

    expect(result).toEqual({
      data: {
        spacerBlockUpdate: expect.objectContaining({
          id,
          parentBlockId: 'newParentId'
        })
      }
    })
  })
})
