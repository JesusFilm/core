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

describe('stepBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const STEP_BLOCK_UPDATE = graphql(`
    mutation StepBlockUpdate($id: ID!, $input: StepBlockUpdateInput!) {
      stepBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on StepBlock {
          locked
          nextBlockId
          x
          y
          slug
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

  it('updates step block when authorized', async () => {
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
          typename: 'StepBlock',
          journeyId: 'journeyId',
          parentBlockId: null,
          parentOrder: 0,
          locked: true,
          nextBlockId: 'nextStepId',
          x: null,
          y: null,
          slug: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: STEP_BLOCK_UPDATE,
      variables: {
        id,
        input: { locked: true, nextBlockId: 'nextStepId' }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          locked: true,
          nextBlockId: 'nextStepId'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        stepBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          locked: true,
          nextBlockId: 'nextStepId'
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: STEP_BLOCK_UPDATE,
      variables: {
        id,
        input: { locked: true }
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

  it('returns BAD_USER_INPUT when nextBlockId equals block id', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const result = await authClient({
      document: STEP_BLOCK_UPDATE,
      variables: {
        id,
        input: { nextBlockId: id }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'nextBlockId cannot be the current step block id'
        })
      ]
    })
  })

  it('slugifies the slug input', async () => {
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
          typename: 'StepBlock',
          journeyId: 'journeyId',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          x: null,
          y: null,
          slug: 'my-custom-step'
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: STEP_BLOCK_UPDATE,
      variables: {
        id,
        input: { slug: 'My Custom Step!' }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          slug: 'my-custom-step'
        })
      })
    )

    expect(result).toEqual({
      data: {
        stepBlockUpdate: expect.objectContaining({
          id,
          slug: 'my-custom-step'
        })
      }
    })
  })
})
