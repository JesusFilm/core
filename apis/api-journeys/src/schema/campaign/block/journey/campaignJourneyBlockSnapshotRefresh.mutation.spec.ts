import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignJourneyBlockSnapshotRefresh', () => {
  const REFRESH = graphql(`
    mutation CampaignJourneyBlockSnapshotRefresh($id: ID!) {
      campaignJourneyBlockSnapshotRefresh(id: $id) {
        id
        journeyId
        title
        description
        titleTranslations {
          languageId
          value
        }
        descriptionTranslations {
          languageId
          value
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const item = campaignBlockWithAcl(fixture, 'landingJourneyListId', {
      id: 'journeyItemId',
      typename: 'CampaignJourneyBlock',
      parentBlockId: 'landingJourneyListId',
      parentOrder: 0,
      journeyId: 'journeyId',
      title: 'Edited title',
      titleTranslations: { '496': { value: 'Titre', source: 'human' } },
      description: 'Edited description',
      descriptionTranslations: {
        '496': { value: 'Description', source: 'machine' }
      }
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(item)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...item, ...data })) as never)
    prismaMock.journey.findFirst.mockResolvedValue({
      id: 'journeyId',
      slug: 'christmas-story',
      title: 'The Christmas story',
      description: 'A short journey through the nativity.',
      status: 'published',
      deletedAt: null,
      team: { id: 'otherTeamId', customDomains: [] },
      journeyCollectionJourneys: []
    } as never)
  })

  async function refresh(id = 'journeyItemId'): Promise<any> {
    return await authClient({ document: REFRESH, variables: { id } })
  }

  it('overwrites the default-language values only and keeps the translations', async () => {
    const result = await refresh()

    expect(result.data.campaignJourneyBlockSnapshotRefresh).toEqual({
      id: 'journeyItemId',
      journeyId: 'journeyId',
      title: 'The Christmas story',
      description: 'A short journey through the nativity.',
      titleTranslations: [{ languageId: '496', value: 'Titre' }],
      descriptionTranslations: [{ languageId: '496', value: 'Description' }]
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'journeyItemId' },
      data: {
        title: 'The Christmas story',
        description: 'A short journey through the nativity.'
      },
      include: { action: true }
    })
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith({
      where: { id: 'journeyId', status: 'published', deletedAt: null },
      include: expect.anything()
    })
  })

  it('clears the description when the journey no longer has one', async () => {
    prismaMock.journey.findFirst.mockResolvedValue({
      id: 'journeyId',
      slug: 'christmas-story',
      title: 'The Christmas story',
      description: null,
      status: 'published',
      deletedAt: null,
      team: { id: 'otherTeamId', customDomains: [] },
      journeyCollectionJourneys: []
    } as never)

    const result = await refresh()

    expect(result.data.campaignJourneyBlockSnapshotRefresh.description).toBe(
      null
    )
  })

  it('rejects a journey that is gone or unpublished (BAD_USER_INPUT, id) and writes nothing', async () => {
    prismaMock.journey.findFirst.mockResolvedValue(null)

    const result = await refresh()

    expect(result.errors[0].message).toBe('Journey not found or not published')
    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for a live block of another typename', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await refresh('heroId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    const outsider = campaignFactory({ userId: 'someoneElse' }).build()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(outsider, 'landingJourneyListId', {
        typename: 'CampaignJourneyBlock',
        journeyId: 'journeyId'
      })
    )

    const result = await refresh()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
