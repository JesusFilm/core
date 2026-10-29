import { campaignBlockWithAcl } from '../../../../../test/campaignBlockAcl'
import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSetup'
import { mockCampaignBlockWrites } from '../../../../../test/campaignBlockWrites'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

/** A live-published journey of another team, as the paste resolution reads it. */
function journeyRow(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id: 'journeyId',
    slug: 'outreach-story',
    title: 'The outreach story',
    description: 'A short journey through the story.',
    status: 'published',
    deletedAt: null,
    teamId: 'otherTeamId',
    team: { id: 'otherTeamId', customDomains: [] },
    journeyCollectionJourneys: [],
    ...overrides
  }
}

const CLIENT_ID = '089533f4-9bff-4587-8ff7-31c8c05187ef'

describe('campaignJourneyBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignJourneyBlockCreate(
      $input: CampaignJourneyBlockCreateInput!
    ) {
      campaignJourneyBlockCreate(input: $input) {
        id
        parentBlockId
        parentOrder
        pageId
        journeyId
        title
        description
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const list = campaignBlockWithAcl(fixture, 'landingJourneyListId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(list)
    prismaMock.campaignBlock.findMany.mockResolvedValue([])
    prismaMock.journey.findFirst.mockResolvedValue(journeyRow() as never)
    mockCampaignBlockWrites(list, { createdId: 'newJourneyItemId' })
  })

  async function create(
    url: string,
    parentBlockId = 'landingJourneyListId',
    id?: string
  ): Promise<CampaignSpecResult<typeof CREATE>> {
    return await authClient({
      document: CREATE,
      variables: { input: { id, parentBlockId, url } }
    })
  }

  it('resolves an admin link and snapshots the title and description as the default-language values', async () => {
    const result = await create('https://admin.nextstep.is/journeys/journeyId')

    expect(result).toEqual({
      data: {
        campaignJourneyBlockCreate: {
          id: 'newJourneyItemId',
          parentBlockId: 'landingJourneyListId',
          parentOrder: 0,
          pageId: 'landingPageId',
          journeyId: 'journeyId',
          title: 'The outreach story',
          description: 'A short journey through the story.'
        }
      }
    })
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'journeyId',
        status: { in: ['published', 'archived'] },
        deletedAt: null
      },
      include: expect.anything()
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: {
        id: undefined,
        typename: 'CampaignJourneyBlock',
        journeyId: 'journeyId',
        title: 'The outreach story',
        description: 'A short journey through the story.',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: 'landingJourneyListId',
        parentOrder: 0
      },
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('resolves a public URL on any domain by slug of any team', async () => {
    const result = await create(
      'https://stories.example.org/outreach-story?lang=es'
    )

    expect(result.errors).toBeUndefined()
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'outreach-story',
        status: { in: ['published', 'archived'] },
        deletedAt: null
      },
      include: expect.anything()
    })
    expect(result.data.campaignJourneyBlockCreate.journeyId).toBe('journeyId')
  })

  it('keeps a client-chosen id', async () => {
    const result = await create(
      'https://admin.nextstep.is/journeys/journeyId',
      'landingJourneyListId',
      CLIENT_ID
    )

    expect(result.data.campaignJourneyBlockCreate.id).toBe(CLIENT_ID)
  })

  it('appends the item as an ordered child of the list, after its siblings', async () => {
    prismaMock.campaignBlock.findMany.mockResolvedValue([
      { id: 'firstItem', parentOrder: 0 },
      { id: 'secondItem', parentOrder: 1 }
    ] as never)

    const result = await create('https://admin.nextstep.is/journeys/journeyId')

    expect(result.data.campaignJourneyBlockCreate).toMatchObject({
      parentBlockId: 'landingJourneyListId',
      parentOrder: 2
    })
  })

  it('cuts a snapshot to the caps an edit is held to', async () => {
    prismaMock.journey.findFirst.mockResolvedValue(
      journeyRow({
        title: 'x'.repeat(250),
        description: 'y'.repeat(1200)
      }) as never
    )

    const result = await create('https://admin.nextstep.is/journeys/journeyId')

    expect(result.data.campaignJourneyBlockCreate.title).toBe('x'.repeat(200))
    expect(result.data.campaignJourneyBlockCreate.description).toBe(
      'y'.repeat(1000)
    )
  })

  it('rejects a journey that is unknown, or neither published nor archived (BAD_USER_INPUT, url)', async () => {
    prismaMock.journey.findFirst.mockResolvedValue(null)

    const result = await create('https://admin.nextstep.is/journeys/draftId')

    expect(result.errors?.[0].message).toBe(
      'Journey not found, or not published or archived'
    )
    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'url'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it.each([
    'not a url',
    'ftp://example.org/journeys/id',
    'https://example.org'
  ])('rejects %s as not a journey link (BAD_USER_INPUT, url)', async (url) => {
    const result = await create(url)

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'url'
    })
  })

  it('rejects a parent that is not a journey list (BAD_USER_INPUT, parentBlockId)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await create(
      'https://admin.nextstep.is/journeys/journeyId',
      'heroId'
    )

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentBlockId'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the parent does not resolve', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await create(
      'https://admin.nextstep.is/journeys/journeyId',
      'missing'
    )

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    const outsider = campaignFactory({ userId: 'someoneElse' }).build()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(outsider, 'landingJourneyListId')
    )

    const result = await create('https://admin.nextstep.is/journeys/journeyId')

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })
})
