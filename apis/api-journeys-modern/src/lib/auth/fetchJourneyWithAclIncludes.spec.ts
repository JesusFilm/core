import { prismaMock } from '../../../test/prismaMock'

import { fetchJourneyWithAclIncludes } from './fetchJourneyWithAclIncludes'

describe('fetchJourneyWithAclIncludes', () => {
  const journeyId = 'jid'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns journey with acl includes', async () => {
    const journey = {
      id: journeyId,
      userJourneys: [],
      team: { userTeams: [] }
    } as any
    prismaMock.journey.findUnique.mockResolvedValue(journey)

    const result = await fetchJourneyWithAclIncludes(journeyId)

    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { id: journeyId },
      include: {
        userJourneys: true,
        team: { include: { userTeams: true } }
      }
    })
    expect(result).toBe(journey)
  })
})
