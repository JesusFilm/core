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

describe('campaignRegionHeaderBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignRegionHeaderBlockCreate ($input: CampaignRegionHeaderBlockCreateInput!) {
      campaignRegionHeaderBlockCreate(input: $input) {
        id
        pageId
        parentBlockId
        parentOrder
        intro
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const hero = campaignBlockWithAcl(fixture, 'heroId')
    prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[1])
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) => block.pageId === 'regionPageId' && block.parentBlockId == null
      )
    )
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => ({
      ...hero,
      eyebrow: null,
      title: null,
      lede: null,
      intro: null,
      align: null,
      action: null,
      ...data,
      id: data.id ?? 'newSectionId'
    })) as never)
  })

  async function create(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: {
        input: { campaignId: 'campaignId', pageId: 'regionPageId', ...input }
      }
    })
  }

  it('creates the section last among the page’s sections with its defaults', async () => {
    const result = await create({})

    expect(result).toEqual({
      data: {
        campaignRegionHeaderBlockCreate: {
          id: 'newSectionId',
          pageId: 'regionPageId',
          parentBlockId: null,
          parentOrder: 5,
          intro: null
        }
      }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        typename: 'CampaignRegionHeaderBlock',
        campaignId: 'campaignId',
        pageId: 'regionPageId',
        regionId: null,
        parentBlockId: null,
        parentOrder: 5
      }),
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('refuses the landing page (BAD_USER_INPUT, pageId)', async () => {
    prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[0])

    const result = await create({ pageId: 'landingPageId' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'pageId'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('caps intro at 500 characters (BAD_USER_INPUT, intro)', async () => {
    const result = await create({ intro: 'x'.repeat(501) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'intro'
    })
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
})
