import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

describe('stepBlockPositionUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const STEP_BLOCK_POSITION_UPDATE = graphql(`
    mutation StepBlockPositionUpdate($input: [StepBlockPositionUpdateInput!]!) {
      stepBlockPositionUpdate(input: $input) {
        id
        journeyId
        ... on StepBlock {
          x
          y
        }
      }
    }
  `)

  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const journey = { id: 'journeyId' }
  const block1 = {
    id: 'blockId1',
    typename: 'StepBlock',
    journeyId: 'journeyId',
    parentBlockId: null,
    parentOrder: 0,
    x: 0,
    y: 0,
    journey
  }
  const block2 = {
    id: 'blockId2',
    typename: 'StepBlock',
    journeyId: 'journeyId',
    parentBlockId: null,
    parentOrder: 1,
    x: 0,
    y: 0,
    journey
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty array when input is empty', async () => {
    const result = await authClient({
      document: STEP_BLOCK_POSITION_UPDATE,
      variables: { input: [] }
    })

    expect(result).toEqual({
      data: { stepBlockPositionUpdate: [] }
    })
    expect(prismaMock.block.findMany).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('updates positions when authorized', async () => {
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([block1, block2] as any)

    const tx = {
      journey: { update: jest.fn().mockResolvedValue(journey) },
      block: {
        update: jest
          .fn()
          .mockResolvedValueOnce({
            ...block1,
            x: 100,
            y: 200
          })
          .mockResolvedValueOnce({
            ...block2,
            x: 300,
            y: 400
          })
      }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: STEP_BLOCK_POSITION_UPDATE,
      variables: {
        input: [
          { id: 'blockId1', x: 100, y: 200 },
          { id: 'blockId2', x: 300, y: 400 }
        ]
      }
    })

    expect(prismaMock.block.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: ['blockId1', 'blockId2'] },
          deletedAt: null
        }
      })
    )
    expect(tx.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId' }
      })
    )
    expect(tx.block.update).toHaveBeenCalledWith({
      where: { id: 'blockId1' },
      data: { x: 100, y: 200 }
    })
    expect(tx.block.update).toHaveBeenCalledWith({
      where: { id: 'blockId2' },
      data: { x: 300, y: 400 }
    })

    expect(result).toEqual({
      data: {
        stepBlockPositionUpdate: [
          expect.objectContaining({ id: 'blockId1', x: 100, y: 200 }),
          expect.objectContaining({ id: 'blockId2', x: 300, y: 400 })
        ]
      }
    })
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([])

    const result = await authClient({
      document: STEP_BLOCK_POSITION_UPDATE,
      variables: {
        input: [{ id: 'nonexistent', x: 0, y: 0 }]
      }
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

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)
    prismaMock.block.findMany.mockResolvedValue([block1] as any)

    const result = await authClient({
      document: STEP_BLOCK_POSITION_UPDATE,
      variables: {
        input: [{ id: 'blockId1', x: 100, y: 200 }]
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
})
