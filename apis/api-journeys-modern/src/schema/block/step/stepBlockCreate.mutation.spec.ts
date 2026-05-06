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

describe('stepBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const STEP_BLOCK_CREATE = graphql(`
    mutation StepBlockCreate($input: StepBlockCreateInput!) {
      stepBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on StepBlock {
          locked
          nextBlockId
          x
          y
        }
      }
    }
  `)

  const {
    fetchJourneyWithAclIncludes
  } = require('../../../lib/auth/fetchJourneyWithAclIncludes')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([] as any)
  })

  it('creates step block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'StepBlock',
          parentOrder: 0,
          journeyId: 'journeyId',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          x: null,
          y: null,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: STEP_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'StepBlock',
          journey: { connect: { id: 'journeyId' } },
          parentOrder: 0
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        stepBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: null,
          locked: false
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: STEP_BLOCK_CREATE,
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
          typename: 'StepBlock',
          parentOrder: 3,
          journeyId: 'journeyId',
          parentBlockId: null,
          locked: true,
          nextBlockId: 'nextStepId',
          x: 100,
          y: 200,
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
      locked: true,
      nextBlockId: 'nextStepId',
      x: 100,
      y: 200
    }

    const result = await authClient({
      document: STEP_BLOCK_CREATE,
      variables: { input: fullInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'StepBlock',
          locked: true,
          nextBlock: { connect: { id: 'nextStepId' } },
          x: 100,
          y: 200,
          parentOrder: 3
        })
      })
    )

    expect(result).toEqual({
      data: {
        stepBlockCreate: expect.objectContaining({
          id: 'customId',
          locked: true,
          nextBlockId: 'nextStepId',
          x: 100,
          y: 200,
          parentOrder: 3
        })
      }
    })
  })
})
