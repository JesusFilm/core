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
})
