import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSetup'
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
  slug: 'outreach-europe',
  title: 'Outreach in Europe, 2026',
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
    // The row re-read under the lock still links the journey unless a test says so.
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: 'journeyId'
    } as never)
  })

  async function refresh(
    id = 'eurRegionId-529'
  ): Promise<CampaignSpecResult<typeof REFRESH>> {
    return await authClient({ document: REFRESH, variables: { id } })
  }

  it('re-reads title and description from the public journey and replaces the snapshot, nothing else', async () => {
    const result = await refresh()

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignRegionLanguageSnapshotRefresh).toEqual({
      id: 'eurRegionId-529',
      journeyId: 'journeyId',
      title: 'Outreach in Europe, 2026',
      description: 'The reworded description.'
    })
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'journeyId',
          status: { in: ['published'] },
          deletedAt: null
        }
      })
    )
    expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'eurRegionId-529' },
        data: {
          title: 'Outreach in Europe, 2026',
          description: 'The reworded description.',
          snapshotEdited: false
        }
      })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('cuts the snapshot to the caps an edit is held to: title 200, description 1000', async () => {
    prismaMock.journey.findFirst.mockResolvedValue({
      ...JOURNEY,
      title: '😀'.repeat(250),
      description: '😀'.repeat(1800)
    } as never)

    await refresh()

    expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          title: '😀'.repeat(200),
          description: '😀'.repeat(1000),
          snapshotEdited: false
        }
      })
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

  it('takes the row lock, then re-reads the linked journey before it writes', async () => {
    await refresh()

    const order = (mock: unknown): number =>
      vi.mocked(mock as () => void).mock.invocationCallOrder[0]
    const lock = prismaMock.$queryRaw.mock.calls[0]
    expect((lock[0] as unknown as string[]).join('?')).toContain('FOR UPDATE')
    expect(lock[1]).toBe('eurRegionId-529')
    expect(order(prismaMock.$queryRaw)).toBeLessThan(
      order(prismaMock.campaignRegionLanguage.findUniqueOrThrow)
    )
    expect(
      prismaMock.campaignRegionLanguage.findUniqueOrThrow
    ).toHaveBeenCalledWith({
      where: { id: 'eurRegionId-529' },
      select: { journeyId: true }
    })
    expect(
      order(prismaMock.campaignRegionLanguage.findUniqueOrThrow)
    ).toBeLessThan(order(prismaMock.campaignRegionLanguage.update))
  })

  it('is BAD_USER_INPUT on journeyId when a concurrent unlink cleared the journey after it was authorised', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null
    } as never)

    const result = await refresh()

    expect(result.errors[0]).toMatchObject({
      message: 'No journey is linked',
      extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
    })
    expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
  })

  it('is CONFLICT on journeyId when a concurrent swap linked another journey after it was authorised', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: 'otherJourneyId'
    } as never)

    const result = await refresh()

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'journeyId'
    })
    expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
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
