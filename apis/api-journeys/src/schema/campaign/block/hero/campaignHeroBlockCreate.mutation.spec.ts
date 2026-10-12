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

describe('campaignHeroBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignHeroBlockCreate($input: CampaignHeroBlockCreateInput!) {
      campaignHeroBlockCreate(input: $input) {
        id
        pageId
        regionId
        parentBlockId
        parentOrder
        backgroundKind
        eyebrow
        title
        lede
        align
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
        id: data.id ?? 'newHeroId'
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

  it('creates an empty hero last among the page’s sections', async () => {
    const result = await create({})

    expect(result).toEqual({
      data: {
        campaignHeroBlockCreate: {
          id: 'newHeroId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: null,
          parentOrder: 5,
          backgroundKind: 'none',
          eyebrow: null,
          title: null,
          lede: null,
          align: null
        }
      }
    })
    expect(prismaMock.campaignPage.findFirst).toHaveBeenCalledWith({
      where: { id: 'landingPageId', campaignId: 'campaignId' }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: {
        id: undefined,
        typename: 'CampaignHeroBlock',
        align: undefined,
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

  it('inserts at the requested position and renumbers the later sections contiguously', async () => {
    const result = await create({
      id: 'clientId',
      parentOrder: 1,
      eyebrow: ' Advent ',
      title: 'A second hero',
      lede: '',
      align: 'left'
    })

    expect(result.data.campaignHeroBlockCreate).toMatchObject({
      id: 'clientId',
      parentOrder: 1,
      eyebrow: 'Advent',
      title: 'A second hero',
      lede: '',
      align: 'left'
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

    expect(result.data.campaignHeroBlockCreate.parentOrder).toBe(5)
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
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
    ['lede', 500]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const result = await create({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    }
  )

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
