import { prismaMock } from '../../../test/prismaMock'

import { getNextParentOrder } from './getNextParentOrder'

describe('getNextParentOrder', () => {
  const journeyId = 'jid'
  const parentBlockId = 'pid'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 0 when there are no siblings', async () => {
    prismaMock.block.findMany.mockResolvedValue([] as any)

    const order = await getNextParentOrder(journeyId, parentBlockId)

    expect(prismaMock.block.findMany).toHaveBeenCalledWith({
      where: {
        journeyId,
        parentBlockId,
        deletedAt: null,
        parentOrder: { not: null }
      },
      orderBy: { parentOrder: 'desc' },
      take: 1
    })
    expect(order).toBe(0)
  })

  it('returns next index based on highest sibling parentOrder', async () => {
    prismaMock.block.findMany.mockResolvedValue([{ parentOrder: 5 }] as any)

    const order = await getNextParentOrder(journeyId, parentBlockId)
    expect(order).toBe(6)
  })
})
