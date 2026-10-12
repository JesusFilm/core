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
import { assertPlacement } from '../service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignTypographyBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignTypographyBlockCreate(
      $input: CampaignTypographyBlockCreateInput!
    ) {
      campaignTypographyBlockCreate(input: $input) {
        id
        parentBlockId
        parentOrder
        pageId
        regionId
        content
        variant
        align
        color
        placement
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const hero = fixture.blocks.find((block) => block.id === 'heroId')!
    const heroButton = campaignBlockWithAcl(fixture, 'heroButtonId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)
    prismaMock.campaignBlock.findMany.mockResolvedValue([heroButton])
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => ({
      ...heroButton,
      action: null,
      ...data,
      id: data.id ?? 'newTextId'
    })) as never)
  })

  async function create(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: {
        input: { campaignId: 'campaignId', parentBlockId: 'heroId', ...input }
      }
    })
  }

  it('creates an empty text Extra below the body, last among the siblings, following the section', async () => {
    const result = await create({})

    expect(result).toEqual({
      data: {
        campaignTypographyBlockCreate: {
          id: 'newTextId',
          parentBlockId: 'heroId',
          parentOrder: 1,
          pageId: 'landingPageId',
          regionId: null,
          content: '',
          variant: null,
          align: null,
          color: null,
          placement: 'below'
        }
      }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: {
        id: undefined,
        typename: 'CampaignTypographyBlock',
        content: '',
        placement: 'below',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: 'heroId',
        parentOrder: 1
      },
      include: { action: true }
    })
  })

  it('places the Extra above the body when asked and keeps a client-chosen id', async () => {
    const result = await create({
      id: 'clientId',
      placement: 'above',
      content: ' Hello ',
      variant: 'h3',
      align: 'center',
      color: '#abc'
    })

    expect(result.data.campaignTypographyBlockCreate).toMatchObject({
      id: 'clientId',
      placement: 'above',
      content: 'Hello',
      variant: 'h3',
      align: 'center',
      color: '#AABBCC'
    })
  })

  it('rejects a placement outside above and below (BAD_USER_INPUT, placement)', () => {
    expect(() => assertPlacement('beside')).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'placement' }
      })
    )
  })

  it('caps content at 2000 characters (BAD_USER_INPUT, content)', async () => {
    const result = await create({ content: 'x'.repeat(2001) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'content'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('rejects a parent that is not a live section of the campaign (BAD_USER_INPUT, parentBlockId)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await create({ parentBlockId: 'missing' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentBlockId'
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

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await create({ campaignId: 'missing' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  describe('Region Lines', () => {
    const region = campaignFactory().withRegion('EUR').build().regions[0]

    async function createLine(input: Record<string, unknown>): Promise<any> {
      return await authClient({
        document: CREATE,
        variables: { input: { campaignId: 'campaignId', ...input } }
      })
    }

    beforeEach(() => {
      prismaMock.campaignRegion.findFirst.mockResolvedValue(region)
      prismaMock.campaignBlock.findMany.mockResolvedValue([])
    })

    it('creates a line scoped to the region with regionId set and pageId, parentBlockId and placement null', async () => {
      const result = await createLine({
        regionId: 'eurRegionId',
        content: 'EUR'
      })

      expect(result).toEqual({
        data: {
          campaignTypographyBlockCreate: {
            id: 'newTextId',
            parentBlockId: null,
            parentOrder: 0,
            pageId: null,
            regionId: 'eurRegionId',
            content: 'EUR',
            variant: null,
            align: null,
            color: null,
            placement: null
          }
        }
      })
      expect(prismaMock.campaignRegion.findFirst).toHaveBeenCalledWith({
        where: { id: 'eurRegionId', campaignId: 'campaignId' }
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: {
          id: undefined,
          typename: 'CampaignTypographyBlock',
          content: 'EUR',
          placement: null,
          campaignId: 'campaignId',
          pageId: null,
          regionId: 'eurRegionId',
          parentBlockId: null,
          parentOrder: 0
        },
        include: { action: true }
      })
    })

    it('rejects a region of another campaign (BAD_USER_INPUT, regionId)', async () => {
      prismaMock.campaignRegion.findFirst.mockResolvedValue(null)

      const result = await createLine({ regionId: 'otherRegionId' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'regionId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('rejects a placement on a line (BAD_USER_INPUT, placement)', async () => {
      const result = await createLine({
        regionId: 'eurRegionId',
        placement: 'above'
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'placement'
      })
    })

    it('rejects neither or both of parentBlockId and regionId (BAD_USER_INPUT, parentBlockId)', async () => {
      expect((await createLine({})).errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(
        (
          await createLine({
            parentBlockId: 'heroId',
            regionId: 'eurRegionId'
          })
        ).errors[0].extensions
      ).toMatchObject({ code: 'BAD_USER_INPUT', field: 'parentBlockId' })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
  })
})
