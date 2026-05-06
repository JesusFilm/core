import { getClient } from '../../../test/client'
import { Action, ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('../../lib/auth/ability', () => ({
  Action: { Read: 'read' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: jest.fn()
}))

describe('block', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BLOCK_QUERY = graphql(`
    query Block($id: ID!) {
      block(id: $id) {
        id
        journeyId
        parentBlockId
        parentOrder
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'
  const journey = { id: 'journeyId' }
  const block = {
    id,
    typename: 'ImageBlock',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 0,
    action: null,
    journey
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
    mockAbility.mockReturnValue(true)

    const result = await authClient({
      document: BLOCK_QUERY,
      variables: { id }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Read,
      { subject: 'Journey', object: journey },
      expect.any(Object)
    )
    expect(result).toEqual({
      data: {
        block: {
          id,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0
        }
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue(block)
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: BLOCK_QUERY,
      variables: { id }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to read block'
        })
      ]
    })
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    const { GraphQLError } = require('graphql')
    fetchBlockWithJourneyAcl.mockRejectedValue(
      new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = await authClient({
      document: BLOCK_QUERY,
      variables: { id }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'block not found'
        })
      ]
    })
  })
})
