import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { getSimpleJourney } from './getSimpleJourney'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    journey: {
      findUnique: jest.fn()
    }
  }
}))

jest.mock('./simplifyJourney', () => ({
  simplifyJourney: jest.fn()
}))

const { prisma } = require('../../../lib/prisma')

const { simplifyJourney } = require('./simplifyJourney')

describe('getSimpleJourney', () => {
  const validJourney = {
    id: 'jid',
    title: 'Journey',
    description: 'desc',
    blocks: []
  }
  const validSimple = { title: 'Journey', description: 'desc', cards: [] }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a valid simplified journey for a valid journeyId', async () => {
    prisma.journey.findUnique.mockResolvedValue(validJourney)
    simplifyJourney.mockReturnValue(validSimple)
    const result = await getSimpleJourney('jid')
    expect(prisma.journey.findUnique).toHaveBeenCalledWith({
      where: { id: 'jid' },
      include: {
        blocks: { where: { deletedAt: null }, include: { action: true } }
      }
    })
    expect(simplifyJourney).toHaveBeenCalledWith(validJourney)
    expect(result).toEqual(validSimple)
    expect(journeySimpleSchema.safeParse(result).success).toBe(true)
  })

  it('throws error if journey is not found', async () => {
    prisma.journey.findUnique.mockResolvedValue(null)
    await expect(getSimpleJourney('jid')).rejects.toThrow('Journey not found')
  })

  it('throws error if transformation result is invalid', async () => {
    prisma.journey.findUnique.mockResolvedValue(validJourney)
    simplifyJourney.mockReturnValue({ foo: 'bar' })
    await expect(getSimpleJourney('jid')).rejects.toThrow(
      'Transformed journey data is invalid'
    )
  })
})
