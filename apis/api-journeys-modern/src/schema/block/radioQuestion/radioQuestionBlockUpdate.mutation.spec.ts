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

describe('radioQuestionBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const RADIO_QUESTION_BLOCK_UPDATE = graphql(`
    mutation RadioQuestionBlockUpdate(
      $id: ID!
      $parentBlockId: ID!
      $gridView: Boolean
    ) {
      radioQuestionBlockUpdate(
        id: $id
        parentBlockId: $parentBlockId
        gridView: $gridView
      ) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on RadioQuestionBlock {
          gridView
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

  it('updates radio question block when authorized', async () => {
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
          typename: 'RadioQuestionBlock',
          journeyId: 'journeyId',
          parentBlockId: 'newParentId',
          parentOrder: 0,
          gridView: true
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: RADIO_QUESTION_BLOCK_UPDATE,
      variables: {
        id,
        parentBlockId: 'newParentId',
        gridView: true
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          parentBlockId: 'newParentId',
          gridView: true
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        radioQuestionBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          parentBlockId: 'newParentId',
          gridView: true
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
      document: RADIO_QUESTION_BLOCK_UPDATE,
      variables: {
        id,
        parentBlockId: 'newParentId'
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

  it('updates without gridView', async () => {
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
          typename: 'RadioQuestionBlock',
          journeyId: 'journeyId',
          parentBlockId: 'newParentId',
          parentOrder: 0,
          gridView: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: RADIO_QUESTION_BLOCK_UPDATE,
      variables: {
        id,
        parentBlockId: 'newParentId'
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          parentBlockId: 'newParentId'
        })
      })
    )

    expect(result).toEqual({
      data: {
        radioQuestionBlockUpdate: expect.objectContaining({
          id,
          parentBlockId: 'newParentId',
          gridView: null
        })
      }
    })
  })
})
