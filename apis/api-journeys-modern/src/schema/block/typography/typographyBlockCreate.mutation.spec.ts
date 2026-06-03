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

describe('typographyBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const TYPOGRAPHY_BLOCK_CREATE = graphql(`
    mutation TypographyBlockCreate($input: TypographyBlockCreateInput!) {
      typographyBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on TypographyBlock {
          content
          variant
          color
          align
        }
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    content: 'Hello World'
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

  it('creates typography block when authorized', async () => {
    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'TypographyBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          content: 'Hello World',
          variant: null,
          color: null,
          align: null,
          settings: null
        }),
        findMany: vi.fn().mockResolvedValue([])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TYPOGRAPHY_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        typename: 'TypographyBlock',
        content: 'Hello World',
        journey: { connect: { id: 'journeyId' } },
        parentBlock: { connect: { id: 'parentBlockId' } },
        parentOrder: 0,
        settings: {}
      })
    })
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        typographyBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          content: 'Hello World'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: TYPOGRAPHY_BLOCK_CREATE,
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

  it('creates with all optional fields', async () => {
    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'customId',
          typename: 'TypographyBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 2,
          content: 'Styled text',
          variant: 'h1',
          color: 'primary',
          align: 'center',
          settings: { color: '#ff0000' }
        }),
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: 'sibling1' }, { id: 'sibling2' }])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TYPOGRAPHY_BLOCK_CREATE,
      variables: {
        input: {
          ...input,
          id: 'customId',
          content: 'Styled text',
          variant: 'h1',
          color: 'primary',
          align: 'center',
          settings: { color: '#ff0000' }
        }
      }
    })

    expect(tx.block.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'customId',
        content: 'Styled text',
        variant: 'h1',
        color: 'primary',
        align: 'center',
        settings: { color: '#ff0000' },
        parentOrder: 2
      })
    })

    expect(result).toEqual({
      data: {
        typographyBlockCreate: expect.objectContaining({
          id: 'customId',
          content: 'Styled text',
          variant: 'h1',
          color: 'primary',
          align: 'center',
          parentOrder: 2
        })
      }
    })
  })
})
