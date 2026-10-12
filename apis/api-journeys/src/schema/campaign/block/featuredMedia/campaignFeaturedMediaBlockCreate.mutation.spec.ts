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

describe('campaignFeaturedMediaBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignFeaturedMediaBlockCreate(
      $input: CampaignFeaturedMediaBlockCreateInput!
    ) {
      campaignFeaturedMediaBlockCreate(input: $input) {
        id
        pageId
        regionId
        parentBlockId
        parentOrder
        backgroundKind
        eyebrow
        title
        lede
        bullets
        mediaSide
        mediaBlockId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const hero = campaignBlockWithAcl(fixture, 'heroId')
    prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[0])
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) =>
          block.pageId === 'landingPageId' && block.parentBlockId == null
      )
    )
    // Created rows persist, as rows do, so the renumber returns the new section's own columns.
    const written = new Map<string, Record<string, unknown>>()
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => {
      const row = {
        ...hero,
        eyebrow: null,
        title: null,
        lede: null,
        align: null,
        action: null,
        ...data,
        id: data.id ?? 'newFeaturedId'
      }
      written.set(row.id, row)
      return row
    }) as never)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...(written.get(where.id) ??
        fixture.blocks.find((block) => block.id === where.id)),
      ...data
    })) as never)
  })

  async function create(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: {
        input: { campaignId: 'campaignId', pageId: 'landingPageId', ...input }
      }
    })
  }

  it('creates an empty Featured Media section last among the page’s sections, media on the right and an empty Media Slot', async () => {
    const result = await create({})

    expect(result).toEqual({
      data: {
        campaignFeaturedMediaBlockCreate: {
          id: 'newFeaturedId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: null,
          parentOrder: 5,
          backgroundKind: 'none',
          eyebrow: null,
          title: null,
          lede: null,
          bullets: null,
          mediaSide: 'right',
          mediaBlockId: null
        }
      }
    })
    expect(prismaMock.campaignPage.findFirst).toHaveBeenCalledWith({
      where: { id: 'landingPageId', campaignId: 'campaignId' }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: {
        id: undefined,
        typename: 'CampaignFeaturedMediaBlock',
        mediaSide: 'right',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: null,
        parentOrder: 5
      },
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('inserts at the requested position with trimmed text, multi-line bullets and the media on the left, renumbering the later sections', async () => {
    const result = await create({
      id: 'clientId',
      parentOrder: 1,
      eyebrow: ' Watch ',
      title: 'The story of Jesus',
      lede: '',
      bullets: 'Two hours long\nIn 2000 languages\nFree to share',
      mediaSide: 'left'
    })

    expect(result.data.campaignFeaturedMediaBlockCreate).toMatchObject({
      id: 'clientId',
      parentOrder: 1,
      eyebrow: 'Watch',
      title: 'The story of Jesus',
      lede: '',
      bullets: 'Two hours long\nIn 2000 languages\nFree to share',
      mediaSide: 'left'
    })
    expect(
      prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => [
        call.where.id,
        call.data.parentOrder
      ])
    ).toEqual([
      ['heroId', 0],
      ['clientId', 1],
      ['landingSwitcherId', 2],
      ['carouselId', 3],
      ['landingJourneyListId', 4],
      ['landingAnalyticsId', 5]
    ])
  })

  it('appends when the position is past the end', async () => {
    const result = await create({ parentOrder: 42 })

    expect(result.data.campaignFeaturedMediaBlockCreate.parentOrder).toBe(5)
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('may be added to the Region Page too', async () => {
    prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[1])
    prismaMock.campaignBlock.findMany.mockResolvedValue([])

    const result = await create({ pageId: 'regionPageId' })

    expect(result.data.campaignFeaturedMediaBlockCreate).toMatchObject({
      pageId: 'regionPageId',
      parentOrder: 0
    })
  })

  it('rejects a negative position (BAD_USER_INPUT, parentOrder)', async () => {
    const result = await create({ parentOrder: -1 })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentOrder'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it.each([
    ['eyebrow', 80],
    ['title', 150],
    ['lede', 500],
    ['bullets', 1000]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await create({ [field]: 'x'.repeat(max) })
      expect(ok.errors).toBeUndefined()

      prismaMock.campaignBlock.create.mockClear()
      const result = await create({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    }
  )

  it('refuses a null mediaSide (BAD_USER_INPUT, mediaSide)', async () => {
    const result = await create({ mediaSide: null })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'mediaSide'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('rejects an unknown mediaSide at the schema (the enum) before the resolver', async () => {
    const result = await create({ mediaSide: 'top' })

    expect(result.errors[0]).toBeDefined()
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('rejects a page of another campaign or an unknown page (BAD_USER_INPUT, pageId)', async () => {
    prismaMock.campaignPage.findFirst.mockResolvedValue(null)

    const result = await create({ pageId: 'missing' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'pageId'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await create({})

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await create({ campaignId: 'missing' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
