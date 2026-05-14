import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { ability } from '../../../lib/auth/ability'
import { fetchJourneyWithAclIncludes } from '../../../lib/auth/fetchJourneyWithAclIncludes'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: vi.fn()
}))

describe('cardBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CARD_BLOCK_CREATE = graphql(`
    mutation CardBlockCreate($input: CardBlockCreateInput!) {
      cardBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        backgroundColor
        fullscreen
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'parentId',
      journeyId: 'journeyId'
    } as any)
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      typename: 'CardBlock',
      parentOrder: 0,
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      backgroundColor: null,
      fullscreen: false
    } as any)
  })

  it('creates card block when authorized', async () => {
    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'CardBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          backgroundColor: null,
          fullscreen: false,
          journey: { id: 'journeyId' }
        }),
        findMany: vi.fn().mockResolvedValue([])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: CARD_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'CardBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } }
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        cardBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          fullscreen: false
        })
      }
    })
  })

  it('creates card block with all optional fields', async () => {
    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'customId',
          typename: 'CardBlock',
          parentOrder: 2,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          backgroundColor: '#FF0000',
          backdropBlur: 20,
          fullscreen: true,
          themeMode: 'dark',
          themeName: 'base',
          journey: { id: 'journeyId' }
        }),
        findMany: vi.fn().mockResolvedValue([{}, {}])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const fullInput = {
      id: 'customId',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      backgroundColor: '#FF0000',
      backdropBlur: 20,
      fullscreen: true,
      themeMode: 'dark' as const,
      themeName: 'base' as const
    }

    const result = await authClient({
      document: CARD_BLOCK_CREATE,
      variables: { input: fullInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'CardBlock',
          backgroundColor: '#FF0000',
          backdropBlur: 20,
          fullscreen: true,
          themeMode: 'dark',
          themeName: 'base',
          parentOrder: 2
        })
      })
    )

    expect(result).toEqual({
      data: {
        cardBlockCreate: expect.objectContaining({
          id: 'customId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          backgroundColor: '#FF0000',
          fullscreen: true
        })
      }
    })
  })
})
