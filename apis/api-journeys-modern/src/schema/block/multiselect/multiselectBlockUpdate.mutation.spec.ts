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

describe('multiselectBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const MULTISELECT_BLOCK_UPDATE = graphql(`
    mutation MultiselectBlockUpdate(
      $id: ID!
      $input: MultiselectBlockUpdateInput!
    ) {
      multiselectBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        min
        max
        submitLabel
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'
  const input = {
    parentBlockId: 'parentId',
    label: 'Updated label',
    submitLabel: 'Updated submit',
    min: 0,
    max: 5
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
    prismaMock.block.findUnique.mockResolvedValue({
      id,
      typename: 'MultiselectBlock',
      journeyId: 'journeyId',
      parentBlockId: input.parentBlockId,
      min: input.min,
      max: input.max,
      submitLabel: input.submitLabel
    } as any)
  })

  it('updates multiselect block when authorized', async () => {
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
          typename: 'MultiselectBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: input.min,
          max: input.max,
          submitLabel: input.submitLabel
        })
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input }
    })

    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id } })
    )
    expect(tx.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId' }
      })
    )

    expect(result).toEqual({
      data: {
        multiselectBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId'
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input }
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

  it('fails when min is negative', async () => {
    // ensure option count is numeric so validation runs before permission check
    prismaMock.block.count.mockResolvedValue(3 as any)
    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: -1 } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'min must be greater than or equal to the number of options',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
        })
      ]
    })
  })

  it('fails when max is negative', async () => {
    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { max: -2 } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'max must be greater than or equal to 0',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
        })
      ]
    })
  })

  it('fails when min is greater than max', async () => {
    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: 5, max: 3 } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'min must be less than or equal to max',
          extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' })
        })
      ]
    })
  })

  it('preserves existing max when omitted in input', async () => {
    const {
      fetchBlockWithJourneyAcl
    } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockImplementation(async (args) => ({
          id,
          typename: 'MultiselectBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          // existing max from DB should be preserved; we simulate it remains 5
          min: 0,
          max: 5,
          submitLabel: 'Submit'
        }))
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: 0 } }
    })

    // ensure we didn't send max in the update payload when omitted
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ max: expect.anything() })
      })
    )
    expect(result).toEqual({
      data: {
        multiselectBlockUpdate: expect.objectContaining({ max: 5 })
      }
    })
  })

  it('nullifies min/max when equal to child count on update', async () => {
    const {
      fetchBlockWithJourneyAcl
    } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
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
          typename: 'MultiselectBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          min: null,
          max: null,
          submitLabel: 'Submit'
        })
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    // mock option count
    prismaMock.block.count.mockResolvedValue(4 as any)

    const result = await authClient({
      document: MULTISELECT_BLOCK_UPDATE,
      variables: { id, input: { min: 4, max: 4 } }
    })

    expect(prismaMock.block.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ parentBlockId: id })
      })
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ min: null, max: null })
      })
    )
    expect(result).toEqual({
      data: {
        multiselectBlockUpdate: expect.objectContaining({
          min: null,
          max: null
        })
      }
    })
  })
})
