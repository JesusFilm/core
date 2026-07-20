import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
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

describe('multiselectBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MULTISELECT_BLOCK_CREATE = graphql(`
    mutation MultiselectBlockCreate($input: MultiselectBlockCreateInput!) {
      multiselectBlockCreate(input: $input) {
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

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
    // Prevent Pothos Prisma plugin from attempting to call unmocked prisma methods
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      typename: 'MultiselectBlock',
      parentOrder: 0,
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      min: null,
      max: null
    } as any)
  })

  it('creates multiselect block when authorized', async () => {
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'MultiselectBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: null,
          max: null,
          journey: { id: 'journeyId' }
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_BLOCK_CREATE,
      variables: { input }
    })

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'MultiselectBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } }
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        multiselectBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: null,
          max: null
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: MULTISELECT_BLOCK_CREATE,
      variables: { input }
    })

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to create block'
        })
      ]
    })
  })

  // min/max removed from create input; defaults to null

  it('starts with min & max null on create', async () => {
    const tx = {
      block: {
        create: vi.fn().mockImplementation(async (args) => ({
          id: 'blockId',
          typename: 'MultiselectBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: null,
          max: null,
          journey: { id: 'journeyId' }
        })),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const minimalInput = {
      journeyId: 'journeyId',
      parentBlockId: 'parentId'
      // min/max omitted on purpose
    }

    const result = await authClient({
      document: MULTISELECT_BLOCK_CREATE,
      variables: { input: minimalInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          max: null,
          min: null
        })
      })
    )
    expect(result).toEqual({
      data: {
        multiselectBlockCreate: expect.objectContaining({
          min: null,
          max: null
        })
      }
    })
  })
})
