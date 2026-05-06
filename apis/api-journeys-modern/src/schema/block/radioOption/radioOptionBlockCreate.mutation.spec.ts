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

describe('radioOptionBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const RADIO_OPTION_BLOCK_CREATE = graphql(`
    mutation RadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
      radioOptionBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        label
      }
    }
  `)

  const {
    fetchJourneyWithAclIncludes
  } = require('../../../lib/auth/fetchJourneyWithAclIncludes')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    label: 'Option A'
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

  it('creates radio option block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'RadioOptionBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Option A',
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: RADIO_OPTION_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'RadioOptionBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } },
          label: 'Option A',
          parentOrder: 0
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        radioOptionBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Option A'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: RADIO_OPTION_BLOCK_CREATE,
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
        create: jest.fn().mockResolvedValue({
          id: 'customId',
          typename: 'RadioOptionBlock',
          parentOrder: 3,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          label: 'Option B',
          eventLabel: 'custom1',
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([{}, {}, {}])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const fullInput = {
      ...input,
      id: 'customId',
      label: 'Option B',
      eventLabel: 'custom1' as const
    }

    const result = await authClient({
      document: RADIO_OPTION_BLOCK_CREATE,
      variables: { input: fullInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'RadioOptionBlock',
          label: 'Option B',
          eventLabel: 'custom1',
          parentOrder: 3
        })
      })
    )

    expect(result).toEqual({
      data: {
        radioOptionBlockCreate: expect.objectContaining({
          id: 'customId',
          label: 'Option B',
          parentOrder: 3
        })
      }
    })
  })
})
