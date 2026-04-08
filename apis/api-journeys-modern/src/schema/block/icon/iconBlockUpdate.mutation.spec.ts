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

describe('iconBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const ICON_BLOCK_UPDATE = graphql(`
    mutation IconBlockUpdate($id: ID!, $input: IconBlockUpdateInput!) {
      iconBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on IconBlock {
          name
          color
          size
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

  it('updates icon block when authorized', async () => {
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
          typename: 'IconBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'md'
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: ICON_BLOCK_UPDATE,
      variables: {
        id,
        input: {
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'md'
        }
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
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'md'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        iconBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'md'
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
      document: ICON_BLOCK_UPDATE,
      variables: {
        id,
        input: { name: 'CheckCircleRounded' }
      }
    })

    expect(result).toEqual({
      data: { iconBlockUpdate: null },
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update block'
        })
      ]
    })
  })

  it('updates with partial input fields', async () => {
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
          typename: 'IconBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          name: 'SendRounded',
          color: null,
          size: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: ICON_BLOCK_UPDATE,
      variables: {
        id,
        input: { name: 'SendRounded' }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          name: 'SendRounded'
        })
      })
    )
    expect(result).toEqual({
      data: {
        iconBlockUpdate: expect.objectContaining({
          id,
          name: 'SendRounded'
        })
      }
    })
  })
})
