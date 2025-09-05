import { prismaMock } from '../../../test/prismaMock'

import { fetchBlockWithJourneyAcl } from './fetchBlockWithJourneyAcl'

describe('fetchBlockWithJourneyAcl', () => {
  const blockId = 'blockId'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns block with journey includes when found', async () => {
    const block = {
      id: blockId,
      journeyId: 'journeyId',
      action: {},
      journey: { id: 'journeyId', userJourneys: [], team: { userTeams: [] } }
    } as any

    prismaMock.block.findUnique.mockResolvedValue(block)

    const result = await fetchBlockWithJourneyAcl(blockId)

    expect(prismaMock.block.findUnique).toHaveBeenCalledWith({
      where: { id: blockId, deletedAt: null },
      include: {
        action: true,
        journey: {
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        }
      }
    })

    expect(result).toBe(block)
  })

  it('throws NOT_FOUND error when block missing', async () => {
    prismaMock.block.findUnique.mockResolvedValue(null)

    await expect(fetchBlockWithJourneyAcl(blockId)).rejects.toThrow(
      'block not found'
    )
  })
})
