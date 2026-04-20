import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: jest.fn()
}))

describe('spacerBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const SPACER_BLOCK_CREATE = graphql(`
    mutation SpacerBlockCreate($input: SpacerBlockCreateInput!) {
      spacerBlockCreate(input: $input) {
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

  const {
    fetchJourneyWithAclIncludes
  } = require('../../../lib/auth/fetchJourneyWithAclIncludes')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'parentId',
      journeyId: 'journeyId'
    } as any)
  })

  it('creates spacer block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'SpacerBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          spacing: null,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SPACER_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'SpacerBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } },
          parentOrder: 0
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        spacerBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: SPACER_BLOCK_CREATE,
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

  it('creates with custom id and spacing', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'customId',
          typename: 'SpacerBlock',
          parentOrder: 2,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          spacing: 150,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([{}, {}])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SPACER_BLOCK_CREATE,
      variables: {
        input: { ...input, id: 'customId', spacing: 150 }
      }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'SpacerBlock',
          spacing: 150,
          parentOrder: 2
        })
      })
    )

    expect(result).toEqual({
      data: {
        spacerBlockCreate: expect.objectContaining({
          id: 'customId',
          spacing: 150,
          parentOrder: 2
        })
      }
    })
  })
})
