import { prismaMock } from '../../../test/prismaMock'

import { CampaignJourneyLive } from './block/campaignJourneyBlock'
import { loadJourneyLivesOfBlocks, withJourneyLive } from './journeyLives'

const LIVE: CampaignJourneyLive = {
  status: 'published',
  url: 'https://example.com/outreach',
  image: null
}

describe('loadJourneyLivesOfBlocks', () => {
  it('reads nothing when no block is a journey card', async () => {
    const lives = await loadJourneyLivesOfBlocks([
      { typename: 'CampaignHeroBlock', journeyId: null },
      { typename: 'CampaignButtonBlock', journeyId: null }
    ])

    expect(lives.size).toBe(0)
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
  })

  it('reads the journeys the journey cards link in one query, skipping a card with no journey', async () => {
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journeyA',
        status: 'published',
        deletedAt: new Date(),
        primaryImageBlock: null
      }
    ] as never)

    const lives = await loadJourneyLivesOfBlocks([
      { typename: 'CampaignJourneyBlock', journeyId: 'journeyA' },
      { typename: 'CampaignJourneyBlock', journeyId: null },
      { typename: 'CampaignJourneyBlock', journeyId: 'journeyB' },
      { typename: 'CampaignHeroBlock', journeyId: null }
    ])

    expect(prismaMock.journey.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['journeyA', 'journeyB'] } }
      })
    )
    expect([...lives.entries()]).toEqual([
      ['journeyA', { status: null, url: null, image: null }]
    ])
  })
})

describe('withJourneyLive', () => {
  const lives = new Map([['journeyA', LIVE]])

  it('returns a block that is not a journey card as it is', () => {
    const hero = { typename: 'CampaignHeroBlock', journeyId: null }

    expect(withJourneyLive(hero, lives)).toBe(hero)
  })

  it('attaches the live read of the journey a card links', () => {
    expect(
      withJourneyLive(
        { typename: 'CampaignJourneyBlock', journeyId: 'journeyA' },
        lives
      )
    ).toEqual({
      typename: 'CampaignJourneyBlock',
      journeyId: 'journeyA',
      journeyLive: LIVE
    })
  })

  it('attaches null to a card with no journey', () => {
    expect(
      withJourneyLive(
        { typename: 'CampaignJourneyBlock', journeyId: null },
        lives
      )
    ).toEqual({
      typename: 'CampaignJourneyBlock',
      journeyId: null,
      journeyLive: null
    })
  })

  it('attaches null to a card whose journey is missing from the lives', () => {
    expect(
      withJourneyLive(
        { typename: 'CampaignJourneyBlock', journeyId: 'deletedJourneyId' },
        lives
      )
    ).toEqual({
      typename: 'CampaignJourneyBlock',
      journeyId: 'deletedJourneyId',
      journeyLive: null
    })
  })
})
