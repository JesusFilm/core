import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionLanguageWithAcl } from '../../../../test/campaignRegionFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

/** The linked journey as the public read serves it, after its author reworded it. */
const JOURNEY = {
  id: 'journeyId',
  slug: 'christmas-europe',
  title: 'Christmas in Europe, 2026',
  description: 'The reworded description.',
  status: 'published',
  deletedAt: null,
  teamId: 'otherTeamId',
  team: { id: 'otherTeamId', customDomains: [] },
  journeyCollectionJourneys: []
}

describe('campaignRegionLanguageSnapshotRefresh', () => {
  const REFRESH = graphql(`
    mutation CampaignRegionLanguageSnapshotRefresh($id: ID!) {
      campaignRegionLanguageSnapshotRefresh(id: $id) {
        id
        journeyId
        title
        description
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory().withRegion('EUR').build()
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529', {
        journeyId: 'journeyId',
        title: 'My own title',
        description: 'My own description',
        qrCodeId: 'qrCodeId'
      })
    )
    prismaMock.campaignRegionLanguage.update.mockImplementation((async ({
      data
    }: any) => ({
      ...fixture.regions[0].languages[0],
      journeyId: 'journeyId',
      qrCodeId: 'qrCodeId',
      ...data
    })) as never)
    prismaMock.journey.findFirst.mockResolvedValue(JOURNEY as never)
  })

  async function refresh(id = 'eurRegionId-529'): Promise<any> {
    return await authClient({ document: REFRESH, variables: { id } })
  }

  it('re-reads title and description from the public journey and replaces the snapshot, nothing else', async () => {
    const result = await refresh()

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignRegionLanguageSnapshotRefresh).toEqual({
      id: 'eurRegionId-529',
      journeyId: 'journeyId',
      title: 'Christmas in Europe, 2026',
      description: 'The reworded description.'
    })
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId', status: 'published', deletedAt: null }
      })
    )
    expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'eurRegionId-529' },
        data: {
          title: 'Christmas in Europe, 2026',
          description: 'The reworded description.'
        }
      })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('is BAD_USER_INPUT on url, "Journey not found or not published", when the journey is no longer published', async () => {
    prismaMock.journey.findFirst.mockResolvedValue(null)

    const result = await refresh()

    expect(result.errors[0]).toMatchObject({
      message: 'Journey not found or not published',
      extensions: { code: 'BAD_USER_INPUT', field: 'url' }
    })
    expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
  })

  it('is BAD_USER_INPUT on journeyId for an Unlinked Language', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
    )

    const result = await refresh()

    expect(result.errors[0]).toMatchObject({
      message: 'No journey is linked',
      extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
    })
    expect(prismaMock.journey.findFirst).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND for an unknown id', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(null)

    const result = await refresh('missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('is FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId',
        '529',
        { journeyId: 'journeyId' }
      )
    )

    const result = await refresh()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
  })
})
