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
import { transformInput } from '../../../block/image/transformInput'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../../block/image/transformInput', () => ({
  transformInput: vi.fn()
}))

const SRC =
  'https://imagedelivery.net/test-cloudflare-account-hash/imageId/public'

const CLIENT_ID = '089533f4-9bff-4587-8ff7-31c8c05187ef'
const NEW_COVER_ID = '07e3144d-97f2-4e73-929b-501b3b1838aa'
const NEW_LOGO_ID = '3580f52c-3a97-4144-b5e5-828de130b790'

describe('campaignImageBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignImageBlockCreate($input: CampaignImageBlockCreateInput!) {
      campaignImageBlockCreate(input: $input) {
        id
        pageId
        regionId
        parentBlockId
        parentOrder
        backgroundKind
        src
        alt
        width
        height
        focalLeft
        focalTop
        scale
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    vi.mocked(transformInput).mockImplementation(async (input) => ({
      ...input,
      width: 1600,
      height: 900,
      blurhash: 'LKO2?U%2Tw'
    }))
    const hero = campaignBlockWithAcl(fixture, 'heroId')
    prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[0])
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) =>
          block.pageId === 'landingPageId' && block.parentBlockId == null
      )
    )
    mockCampaignBlockWrites(
      { ...hero, eyebrow: null, title: null, description: null, align: null },
      { createdId: 'newImageId', blocks: fixture.blocks }
    )
  })

  async function create(
    input: Record<string, unknown>
  ): Promise<CampaignSpecResult<typeof CREATE>> {
    return await authClient({
      document: CREATE,
      variables: { input: { campaignId: 'campaignId', ...input } }
    })
  }

  describe('the Image section role', () => {
    it('creates an image section last among the page’s sections with the server-measured size', async () => {
      const result = await create({
        pageId: 'landingPageId',
        src: ` ${SRC} `,
        alt: ' A picture '
      })

      expect(result).toEqual({
        data: {
          campaignImageBlockCreate: {
            id: 'newImageId',
            pageId: 'landingPageId',
            regionId: null,
            parentBlockId: null,
            parentOrder: 5,
            backgroundKind: 'none',
            src: SRC,
            alt: 'A picture',
            width: 1600,
            height: 900,
            focalLeft: 50,
            focalTop: 50,
            scale: null
          }
        }
      })
      expect(transformInput).toHaveBeenCalledWith(
        expect.objectContaining({ src: SRC })
      )
      const { data } = prismaMock.campaignBlock.create.mock.calls[0][0] as any
      expect(data).toMatchObject({
        typename: 'CampaignImageBlock',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: null,
        parentOrder: 5,
        src: SRC,
        alt: 'A picture',
        width: 1600,
        height: 900
      })
      // The transform's blurhash is discarded: the column does not exist.
      expect(data).not.toHaveProperty('blurhash')
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })

    it('creates an empty image section (no src, no size) at the requested position', async () => {
      const result = await create({
        id: CLIENT_ID,
        pageId: 'landingPageId',
        parentOrder: 1
      })

      expect(result.data.campaignImageBlockCreate).toMatchObject({
        id: CLIENT_ID,
        parentOrder: 1,
        src: null,
        width: null,
        height: null
      })
      expect(transformInput).not.toHaveBeenCalled()
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => [
          call.where.id,
          call.data.parentOrder
        ])
      ).toEqual([
        ['heroId', 0],
        [CLIENT_ID, 1],
        ['landingSwitcherId', 2],
        ['carouselId', 3],
        ['landingJourneyListId', 4],
        ['landingAnalyticsId', 5]
      ])
    })

    it('stores the focal point and the zoom it is given', async () => {
      const result = await create({
        pageId: 'landingPageId',
        src: SRC,
        focalLeft: 20,
        focalTop: 80,
        scale: 150
      })

      expect(result.data.campaignImageBlockCreate).toMatchObject({
        focalLeft: 20,
        focalTop: 80,
        scale: 150
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            focalLeft: 20,
            focalTop: 80,
            scale: 150
          })
        })
      )
    })

    it('rejects a zoom of 250, outside 100 to 200 (BAD_USER_INPUT, scale)', async () => {
      const result = await create({
        pageId: 'landingPageId',
        src: SRC,
        scale: 250
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'scale'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('rejects a page of another campaign (BAD_USER_INPUT, pageId)', async () => {
      prismaMock.campaignPage.findFirst.mockResolvedValue(null)

      const result = await create({ pageId: 'missing', src: SRC })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'pageId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
  })

  describe('src (PRD §15)', () => {
    it.each([
      [
        'http://imagedelivery.net/test-cloudflare-account-hash/imageId/public',
        'http'
      ],
      ['https://example.com/picture.jpg', 'another https host'],
      [
        'https://imagedelivery.net/someOtherAccount/imageId/public',
        'another Cloudflare account'
      ],
      ['not a url', 'not a URL']
    ])(
      'rejects %s (%s) with BAD_USER_INPUT on src before measuring or writing',
      async (src) => {
        const result = await create({ pageId: 'landingPageId', src })

        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'src'
        })
        expect(transformInput).not.toHaveBeenCalled()
        expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
      }
    )

    it('reports an image the server cannot read as BAD_USER_INPUT on src', async () => {
      vi.mocked(transformInput).mockRejectedValue(new Error('fetch failed'))

      const result = await create({ pageId: 'landingPageId', src: SRC })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'src'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('caps alt at 500 characters (BAD_USER_INPUT, alt)', async () => {
      const result = await create({
        pageId: 'landingPageId',
        alt: 'x'.repeat(501)
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'alt'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
  })

  describe('the owned role (cover or logo)', () => {
    it('requires exactly one of pageId and parentBlockId (BAD_USER_INPUT, pageId)', async () => {
      for (const input of [
        { src: SRC },
        { pageId: 'landingPageId', parentBlockId: 'heroId', src: SRC }
      ]) {
        const result = await create(input)
        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'pageId'
        })
      }
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('creates a cover with parentOrder null, the owner’s scoping and points coverBlockId at it, replacing the previous cover', async () => {
      const hero = fixture.blocks.find((block) => block.id === 'heroId')!
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        ...hero,
        coverBlockId: 'oldCoverId'
      })

      const result = await create({
        id: NEW_COVER_ID,
        parentBlockId: 'heroId',
        slot: 'cover',
        src: SRC
      })

      expect(result.data.campaignImageBlockCreate).toMatchObject({
        id: NEW_COVER_ID,
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: 'heroId',
        parentOrder: null,
        src: SRC,
        width: 1600,
        height: 900
      })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'heroId',
          campaignId: 'campaignId',
          deletedAt: null,
          parentOrder: { not: null }
        }
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: NEW_COVER_ID,
          typename: 'CampaignImageBlock',
          campaignId: 'campaignId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: 'heroId',
          parentOrder: null
        }),
        include: { action: true }
      })
      expect(prismaMock.campaignBlock.updateMany).toHaveBeenCalledWith({
        where: { id: 'oldCoverId', parentBlockId: 'heroId' },
        data: { deletedAt: expect.any(Date) }
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroId' },
        data: { coverBlockId: NEW_COVER_ID }
      })
      // Siblings are never read for an owned block.
      expect(prismaMock.campaignBlock.findMany).not.toHaveBeenCalled()
    })

    it('stores the cover’s focal point and zoom', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        fixture.blocks.find((block) => block.id === 'heroId')!
      )

      const result = await create({
        id: NEW_COVER_ID,
        parentBlockId: 'heroId',
        slot: 'cover',
        src: SRC,
        focalLeft: 0,
        focalTop: 100,
        scale: 200
      })

      expect(result.data.campaignImageBlockCreate).toMatchObject({
        id: NEW_COVER_ID,
        focalLeft: 0,
        focalTop: 100,
        scale: 200
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: NEW_COVER_ID,
            focalLeft: 0,
            focalTop: 100,
            scale: 200
          })
        })
      )
    })

    it('rejects a cover zoom of 250, outside 100 to 200 (BAD_USER_INPUT, scale)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        fixture.blocks.find((block) => block.id === 'heroId')!
      )

      const result = await create({
        parentBlockId: 'heroId',
        slot: 'cover',
        src: SRC,
        scale: 250
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'scale'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('defaults the slot to cover', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        fixture.blocks.find((block) => block.id === 'heroId')!
      )

      await create({ parentBlockId: 'heroId', src: SRC })

      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroId' },
        data: { coverBlockId: 'newImageId' }
      })
    })

    it('creates the header logo with chrome scoping and points logoBlockId at it', async () => {
      const header = fixture.blocks.find((block) => block.id === 'headerId')!
      prismaMock.campaignBlock.findFirst.mockResolvedValue(header)

      const result = await create({
        id: NEW_LOGO_ID,
        parentBlockId: 'headerId',
        slot: 'logo',
        src: SRC,
        alt: 'Outreach logo'
      })

      expect(result.data.campaignImageBlockCreate).toMatchObject({
        id: NEW_LOGO_ID,
        pageId: null,
        regionId: null,
        parentBlockId: 'headerId',
        parentOrder: null,
        alt: 'Outreach logo'
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'headerId' },
        data: { logoBlockId: NEW_LOGO_ID }
      })
    })

    it('refuses the logo slot on anything but the header (BAD_USER_INPUT, logoBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        fixture.blocks.find((block) => block.id === 'heroId')!
      )

      const result = await create({
        parentBlockId: 'heroId',
        slot: 'logo',
        src: SRC
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'logoBlockId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('refuses an Extra, a soft-deleted block or another campaign’s block as owner (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(
        fixture.blocks.find((block) => block.id === 'heroButtonId')!
      )
      const extra = await create({ parentBlockId: 'heroButtonId', src: SRC })
      expect(extra.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })

      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(null)
      const missing = await create({ parentBlockId: 'elsewhere', src: SRC })
      expect(missing.errors[0].extensions).toMatchObject({
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

    const result = await create({ pageId: 'landingPageId', src: SRC })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await create({ campaignId: 'missing', pageId: 'p' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
