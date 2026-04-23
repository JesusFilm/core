import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('blocks', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const BLOCKS_QUERY = graphql(`
    query Blocks($where: BlocksFilter) {
      blocks(where: $where) {
        id
        journeyId
        parentBlockId
        parentOrder
      }
    }
  `)

  const block = {
    id: 'blockId',
    typename: 'StepBlock',
    journeyId: 'journeyId',
    parentBlockId: null,
    parentOrder: 0,
    action: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns blocks when authorized', async () => {
    prismaMock.block.findMany.mockResolvedValue([block as any])

    const result = await authClient({
      document: BLOCKS_QUERY,
      variables: { where: null }
    })

    expect(result).toEqual({
      data: {
        blocks: [
          {
            id: 'blockId',
            journeyId: 'journeyId',
            parentBlockId: null,
            parentOrder: 0
          }
        ]
      }
    })

    expect(prismaMock.block.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            journey: {
              is: expect.objectContaining({
                OR: expect.arrayContaining([
                  expect.objectContaining({
                    team: expect.any(Object)
                  })
                ])
              })
            }
          },
          { deletedAt: null }
        ]
      },
      include: {
        action: true
      }
    })
  })

  it('returns filtered blocks by journeyIds and typenames', async () => {
    prismaMock.block.findMany.mockResolvedValue([block as any])

    const result = await authClient({
      document: BLOCKS_QUERY,
      variables: {
        where: {
          journeyIds: ['journeyId'],
          typenames: ['StepBlock']
        }
      }
    })

    expect(result).toEqual({
      data: {
        blocks: [
          {
            id: 'blockId',
            journeyId: 'journeyId',
            parentBlockId: null,
            parentOrder: 0
          }
        ]
      }
    })

    expect(prismaMock.block.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            journey: {
              is: expect.objectContaining({
                OR: expect.any(Array)
              })
            }
          },
          {
            journeyId: { in: ['journeyId'] },
            typename: { in: ['StepBlock'] },
            deletedAt: null
          }
        ]
      },
      include: {
        action: true
      }
    })
  })

  it('returns empty array when no blocks found', async () => {
    prismaMock.block.findMany.mockResolvedValue([])

    const result = await authClient({
      document: BLOCKS_QUERY,
      variables: { where: null }
    })

    expect(result).toEqual({
      data: {
        blocks: []
      }
    })
  })
})
