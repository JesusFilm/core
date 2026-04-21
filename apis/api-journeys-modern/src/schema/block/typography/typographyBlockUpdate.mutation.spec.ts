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

describe('typographyBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const TYPOGRAPHY_BLOCK_UPDATE = graphql(`
    mutation TypographyBlockUpdate(
      $id: ID!
      $input: TypographyBlockUpdateInput!
    ) {
      typographyBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on TypographyBlock {
          content
          variant
          color
          align
          settings {
            color
          }
        }
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates typography block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: null,
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'TypographyBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          content: 'Updated text',
          variant: 'h2',
          color: null,
          align: null,
          settings: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TYPOGRAPHY_BLOCK_UPDATE,
      variables: {
        id,
        input: { content: 'Updated text', variant: 'h2' }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          content: 'Updated text',
          variant: 'h2'
        })
      })
    )

    expect(result).toEqual({
      data: {
        typographyBlockUpdate: expect.objectContaining({
          id,
          content: 'Updated text',
          variant: 'h2'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: null,
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: TYPOGRAPHY_BLOCK_UPDATE,
      variables: {
        id,
        input: { content: 'Updated' }
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

  it('merges settings with existing block settings', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: { color: '#000000' },
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'TypographyBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          content: 'Text',
          variant: null,
          color: null,
          align: null,
          settings: { color: '#ff0000' }
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: TYPOGRAPHY_BLOCK_UPDATE,
      variables: {
        id,
        input: { settings: { color: '#ff0000' } }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          settings: { color: '#ff0000' }
        })
      })
    )

    expect(result).toEqual({
      data: {
        typographyBlockUpdate: expect.objectContaining({
          id,
          settings: { color: '#ff0000' }
        })
      }
    })
  })

  it('does not pass settings when input.settings is null', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      settings: { color: '#000000' },
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'TypographyBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          content: 'Updated',
          variant: null,
          color: null,
          align: null,
          settings: { color: '#000000' }
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
      document: TYPOGRAPHY_BLOCK_UPDATE,
      variables: {
        id,
        input: { content: 'Updated' }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          content: 'Updated',
          settings: undefined
        })
      })
    )
  })
})
