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

describe('textResponseBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const TEXT_RESPONSE_BLOCK_CREATE = graphql(`
    mutation TextResponseBlockCreate($input: TextResponseBlockCreateInput!) {
      textResponseBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on TextResponseBlock {
          label
        }
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    label: 'Your answer'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'parentBlockId',
      journeyId: 'journeyId'
    } as any)
  })

  it('creates text response block when authorized', async () => {
    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'newBlockId',
          typename: 'TextResponseBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          label: 'Your answer'
        }),
        findMany: vi.fn().mockResolvedValue([])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        typename: 'TextResponseBlock',
        label: 'Your answer',
        journey: { connect: { id: 'journeyId' } },
        parentBlock: { connect: { id: 'parentBlockId' } },
        parentOrder: 0
      })
    })
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        textResponseBlockCreate: expect.objectContaining({
          id: 'newBlockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          label: 'Your answer'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_CREATE,
      variables: { input }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to create block'
        })
      ]
    })
  })

  it('creates with custom id and correct parent order', async () => {
    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'customId',
          typename: 'TextResponseBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 2,
          label: 'Name'
        }),
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: 'sibling1' }, { id: 'sibling2' }])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TEXT_RESPONSE_BLOCK_CREATE,
      variables: {
        input: {
          ...input,
          id: 'customId',
          label: 'Name'
        }
      }
    })

    expect(tx.block.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'customId',
        parentOrder: 2
      })
    })

    expect(result).toEqual({
      data: {
        textResponseBlockCreate: expect.objectContaining({
          id: 'customId',
          parentOrder: 2,
          label: 'Name'
        })
      }
    })
  })
})
