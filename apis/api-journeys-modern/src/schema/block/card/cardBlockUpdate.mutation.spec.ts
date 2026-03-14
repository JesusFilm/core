import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: jest.fn()
}))

describe('cardBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CARD_BLOCK_UPDATE = graphql(`
    mutation CardBlockUpdate($id: ID!, $input: CardBlockUpdateInput!) {
      cardBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        backgroundColor
        fullscreen
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'
  const input = {
    backgroundColor: '#FF0000'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findFirst.mockResolvedValue({
      id,
      typename: 'CardBlock',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      parentOrder: 0,
      backgroundColor: '#FF0000',
      fullscreen: false
    } as any)
  })

  it('updates card block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'CardBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          backgroundColor: '#FF0000',
          fullscreen: false
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: CARD_BLOCK_UPDATE,
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
          backgroundColor: '#FF0000'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        cardBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          backgroundColor: '#FF0000',
          fullscreen: false
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: CARD_BLOCK_UPDATE,
      variables: { id, input }
    })

    expect(result).toEqual({
      data: { cardBlockUpdate: null },
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update block'
        })
      ]
    })
  })

  it('updates card block with all optional fields', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'CardBlock',
          journeyId: 'journeyId',
          parentBlockId: 'newParentId',
          parentOrder: 0,
          backgroundColor: '#00FF00',
          backdropBlur: 10,
          coverBlockId: 'coverId',
          fullscreen: true,
          themeMode: 'dark',
          themeName: 'base'
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'newParentId',
      journeyId: 'journeyId'
    } as any)

    const fullInput = {
      parentBlockId: 'newParentId',
      coverBlockId: 'coverId',
      backgroundColor: '#00FF00',
      backdropBlur: 10,
      fullscreen: true,
      themeMode: 'dark' as const,
      themeName: 'base' as const
    }

    const result = await authClient({
      document: CARD_BLOCK_UPDATE,
      variables: { id, input: fullInput }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          backgroundColor: '#00FF00',
          backdropBlur: 10,
          coverBlockId: 'coverId',
          fullscreen: true,
          themeMode: 'dark',
          themeName: 'base'
        })
      })
    )

    expect(result).toEqual({
      data: {
        cardBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          backgroundColor: '#00FF00',
          fullscreen: true
        })
      }
    })
  })
})
