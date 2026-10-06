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

describe('campaignRichTextBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignRichTextBlockCreate(
      $input: CampaignRichTextBlockCreateInput!
    ) {
      campaignRichTextBlockCreate(input: $input) {
        id
        pageId
        parentBlockId
        parentOrder
        title
        content
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
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => ({
      ...hero,
      eyebrow: null,
      title: null,
      lede: null,
      intro: null,
      content: null,
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
        input: { campaignId: 'campaignId', pageId: 'landingPageId', ...input }
      }
    })
  }

  it('creates the section last among the page’s sections', async () => {
    const result = await create({
      title: 'Our story',
      content: 'First.\n\nSecond.'
    })

    expect(result).toEqual({
      data: {
        campaignRichTextBlockCreate: {
          id: 'newSectionId',
          pageId: 'landingPageId',
          parentBlockId: null,
          parentOrder: 5,
          title: 'Our story',
          content: 'First.\n\nSecond.'
        }
      }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        typename: 'CampaignRichTextBlock',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: null,
        parentOrder: 5
      }),
      include: { action: true }
    })
  })

  it.each([
    ['title', 150],
    ['content', 5000]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await create({ [field]: 'x'.repeat(max) })
      expect(ok.errors).toBeUndefined()

      const result = await create({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  describe('in a column slot', () => {
    const slot = {
      id: 'slotId',
      campaignId: 'campaignId',
      pageId: 'landingPageId',
      regionId: null,
      typename: 'CampaignColumnBlock',
      parentBlockId: 'columnsId',
      parentOrder: 0
    }

    beforeEach(() => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(slot as never)
    })

    it('creates the slot’s only section at parentOrder 0 under the slot', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([])

      const result = await create({ parentBlockId: 'slotId', parentOrder: 3 })

      expect(result.data.campaignRichTextBlockCreate).toMatchObject({
        parentBlockId: 'slotId',
        parentOrder: 0,
        pageId: 'landingPageId'
      })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: 'slotId',
          typename: 'CampaignColumnBlock',
          deletedAt: null
        })
      })
    })

    it('refuses a slot that already holds a section (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        campaignBlockWithAcl(fixture, 'heroId')
      ])

      const result = await create({ parentBlockId: 'slotId' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('refuses a parent that is not a live column slot on the page (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const result = await create({ parentBlockId: 'heroId' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
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
