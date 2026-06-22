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

describe('buttonBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BUTTON_BLOCK_UPDATE = graphql(`
    mutation ButtonBlockUpdate($id: ID!, $input: ButtonBlockUpdateInput!) {
      buttonBlockUpdate(id: $id, input: $input) {
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
    label: 'Updated Label'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findFirst.mockResolvedValue({
      id,
      typename: 'ButtonBlock',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      parentOrder: 0,
      label: 'Updated Label',
      settings: {}
    } as any)
  })

  it('updates button block when authorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: {},
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'ButtonBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          label: 'Updated Label',
          settings: {}
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: BUTTON_BLOCK_UPDATE,
      variables: { id, input }
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
          label: 'Updated Label'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        buttonBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          label: 'Updated Label'
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: {},
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: BUTTON_BLOCK_UPDATE,
      variables: { id, input }
    })

    expect(result).toEqual({
      data: { buttonBlockUpdate: null },
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update block'
        })
      ]
    })
  })

  it('throws BAD_USER_INPUT when startIconId is invalid', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: {},
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: BUTTON_BLOCK_UPDATE,
      variables: { id, input: { startIconId: 'nonExistentId' } }
    })

    expect(result).toEqual({
      data: { buttonBlockUpdate: null },
      errors: [
        expect.objectContaining({
          message: 'Start icon does not exist'
        })
      ]
    })
  })

  it('throws BAD_USER_INPUT when endIconId is invalid', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: {},
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: BUTTON_BLOCK_UPDATE,
      variables: { id, input: { endIconId: 'nonExistentId' } }
    })

    expect(result).toEqual({
      data: { buttonBlockUpdate: null },
      errors: [
        expect.objectContaining({
          message: 'End icon does not exist'
        })
      ]
    })
  })

  it('merges settings with existing block settings', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: { alignment: 'left', color: '#000000' },
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'ButtonBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          label: 'Button',
          settings: { alignment: 'left', color: '#ff0000' }
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
      document: BUTTON_BLOCK_UPDATE,
      variables: {
        id,
        input: { settings: { color: '#ff0000' } }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          settings: { alignment: 'left', color: '#ff0000' }
        })
      })
    )
  })

  it('does not update settings when not provided', async () => {
    ;(fetchBlockWithJourneyAcl as any).mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: { alignment: 'center' },
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: vi.fn().mockResolvedValue({
          id,
          typename: 'ButtonBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          label: 'New Label',
          settings: { alignment: 'center' }
        })
      },
      action: { upsert: vi.fn(), delete: vi.fn() },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
      document: BUTTON_BLOCK_UPDATE,
      variables: { id, input: { label: 'New Label' } }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          settings: expect.anything()
        })
      })
    )
  })
})
