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

describe('signUpBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const SIGN_UP_BLOCK_CREATE = graphql(`
    mutation SignUpBlockCreate($input: SignUpBlockCreateInput!) {
      signUpBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        submitLabel
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
    submitLabel: 'Sign Up'
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

  it('creates sign up block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'SignUpBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          submitLabel: 'Sign Up',
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SIGN_UP_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'SignUpBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } },
          submitLabel: 'Sign Up',
          parentOrder: 0
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        signUpBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          submitLabel: 'Sign Up'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: SIGN_UP_BLOCK_CREATE,
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
        create: jest.fn().mockResolvedValue({
          id: 'customId',
          typename: 'SignUpBlock',
          parentOrder: 2,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          submitLabel: 'Join Now',
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([{}, {}])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: SIGN_UP_BLOCK_CREATE,
      variables: {
        input: { ...input, id: 'customId', submitLabel: 'Join Now' }
      }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'SignUpBlock',
          submitLabel: 'Join Now',
          parentOrder: 2
        })
      })
    )

    expect(result).toEqual({
      data: {
        signUpBlockCreate: expect.objectContaining({
          id: 'customId',
          submitLabel: 'Join Now',
          parentOrder: 2
        })
      }
    })
  })
})
