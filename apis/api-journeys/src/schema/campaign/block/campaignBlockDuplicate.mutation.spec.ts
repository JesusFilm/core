import { campaignBlockWithAcl } from '../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignBlockRow,
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const HERO_COPY_ID = 'dba93414-2864-41ed-801d-43f535a9e73e'
const HERO_BUTTON_COPY_ID = '1929440e-3b7f-41e0-b5db-45489f2ab155'
const HERO_MEDIA_COPY_ID = '1f4216be-2642-4f2d-a4a7-7512e06bda00'
const COLUMNS_COPY_ID = 'f594bc44-c5a8-480d-b7ea-cbd7a72e98f5'
const SLOT_LEFT_COPY_ID = 'c0766f79-1f71-495f-b289-b8708e0222c7'
const SLOT_RIGHT_COPY_ID = '42850655-d582-4511-9770-f3c69a746f54'
const SLOT_HERO_COPY_ID = 'e55e9041-3b12-4000-b0f4-496845a0c5ee'

describe('campaignBlockDuplicate', () => {
  const DUPLICATE = graphql(`
    mutation CampaignBlockDuplicate(
      $id: ID!
      $idMap: [CampaignBlockDuplicateIdMapInput!]
    ) {
      campaignBlockDuplicate(id: $id, idMap: $idMap) {
        id
        parentBlockId
        parentOrder
        ... on CampaignHeroBlock {
          title
          mediaBlockId
        }
        ... on CampaignButtonBlock {
          label
          action {
            __typename
            ... on CampaignScrollToBlockAction {
              blockId
            }
          }
        }
      }
    }
  `)

  let fixture: CampaignFixture
  /** Rows the mocked create and update wrote, by id. */
  let written: Map<string, CampaignBlockRow>

  function setLive(blocks: CampaignBlockRow[]): void {
    prismaMock.campaignBlock.findMany
      .mockResolvedValueOnce(blocks)
      .mockResolvedValueOnce(
        blocks.filter(
          (block) =>
            block.pageId === 'landingPageId' && block.parentBlockId == null
        )
      )
  }

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    written = new Map()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => {
      const row = { ...fixture.blocks[0], ...data, action: null }
      written.set(row.id, row)
      return row
    }) as never)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      where,
      data
    }: any) => {
      const { action, ...columns } = data
      const before =
        written.get(where.id) ??
        fixture.blocks.find((block) => block.id === where.id)
      const row = {
        ...before,
        ...columns,
        action:
          action?.create != null
            ? { campaignBlockId: where.id, ...action.create }
            : (before?.action ?? null)
      }
      written.set(where.id, row)
      return row
    }) as never)
  })

  async function duplicate(
    id: string,
    idMap?: Array<{ oldId: string; newId: string }>
  ): Promise<any> {
    return await authClient({ document: DUPLICATE, variables: { id, idMap } })
  }

  it('deep-copies a section with its children and actions under new ids and inserts it after the original', async () => {
    setLive(fixture.blocks)

    const result = await duplicate('heroId', [
      { oldId: 'heroId', newId: HERO_COPY_ID },
      { oldId: 'heroButtonId', newId: HERO_BUTTON_COPY_ID }
    ])

    expect(result.data.campaignBlockDuplicate).toEqual([
      {
        id: 'heroId',
        parentBlockId: null,
        parentOrder: 0,
        title: 'Share the story',
        mediaBlockId: null
      },
      {
        id: HERO_COPY_ID,
        parentBlockId: null,
        parentOrder: 1,
        title: 'Share the story',
        mediaBlockId: null
      },
      { id: 'landingSwitcherId', parentBlockId: null, parentOrder: 2 },
      { id: 'carouselId', parentBlockId: null, parentOrder: 3 },
      { id: 'landingJourneyListId', parentBlockId: null, parentOrder: 4 },
      { id: 'landingAnalyticsId', parentBlockId: null, parentOrder: 5 },
      {
        id: HERO_BUTTON_COPY_ID,
        parentBlockId: HERO_COPY_ID,
        parentOrder: 0,
        label: 'Choose your region',
        action: {
          __typename: 'CampaignScrollToBlockAction',
          blockId: 'landingSwitcherId'
        }
      }
    ])
    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        id: HERO_COPY_ID,
        typename: 'CampaignHeroBlock',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: null,
        parentOrder: 5,
        eyebrow: 'Your campaign',
        align: 'center'
      }),
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        id: HERO_BUTTON_COPY_ID,
        typename: 'CampaignButtonBlock',
        parentBlockId: HERO_COPY_ID,
        parentOrder: 0,
        placement: 'below'
      }),
      include: { action: true }
    })
    // The action is recreated on the copy, pointing at the same target outside the copy.
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: HERO_BUTTON_COPY_ID },
      data: {
        action: {
          create: {
            blockId: 'landingSwitcherId',
            regionId: null,
            url: null,
            target: null
          }
        }
      },
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('remaps slot columns and action targets that point inside the copy', async () => {
    const hero = fixture.blocks.find((block) => block.id === 'heroId')!
    // An owned Media Slot block: `parentOrder: null`, named by the hero's
    // `mediaBlockId`. Typed as a typography block only because the image and
    // video typenames arrive with later tickets and the response resolves
    // every copy to a GraphQL type.
    const media: CampaignBlockRow = {
      ...hero,
      id: 'heroMediaId',
      typename: 'CampaignTypographyBlock',
      parentBlockId: 'heroId',
      parentOrder: null,
      content: 'poster'
    }
    setLive(
      fixture.blocks
        .map((block) => {
          if (block.id === 'heroId')
            return { ...block, mediaBlockId: 'heroMediaId' }
          if (block.id === 'heroButtonId')
            return { ...block, action: { ...block.action!, blockId: 'heroId' } }
          return block
        })
        .concat(media)
    )

    const result = await duplicate('heroId', [
      { oldId: 'heroId', newId: HERO_COPY_ID },
      { oldId: 'heroMediaId', newId: HERO_MEDIA_COPY_ID },
      { oldId: 'heroButtonId', newId: HERO_BUTTON_COPY_ID }
    ])

    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: HERO_MEDIA_COPY_ID,
        typename: 'CampaignTypographyBlock',
        parentBlockId: HERO_COPY_ID,
        parentOrder: null,
        content: 'poster'
      }),
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: HERO_COPY_ID },
      data: { mediaBlockId: HERO_MEDIA_COPY_ID },
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: HERO_BUTTON_COPY_ID },
      data: {
        action: {
          create: {
            blockId: HERO_COPY_ID,
            regionId: null,
            url: null,
            target: null
          }
        }
      },
      include: { action: true }
    })
    const ids = result.data.campaignBlockDuplicate.map((block: any) => block.id)
    expect(ids).toContain(HERO_MEDIA_COPY_ID)
    expect(ids).toContain(HERO_BUTTON_COPY_ID)
  })

  it('leaves a slot empty when its owned block is not live, instead of reusing the original’s id', async () => {
    setLive(
      fixture.blocks.map((block) =>
        block.id === 'heroId'
          ? { ...block, mediaBlockId: 'deletedMediaId' }
          : block
      )
    )

    await duplicate('heroId', [{ oldId: 'heroId', newId: HERO_COPY_ID }])

    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: HERO_COPY_ID },
        data: expect.objectContaining({ mediaBlockId: expect.anything() })
      })
    )
  })

  it('generates ids for blocks the idMap leaves out', async () => {
    setLive(fixture.blocks)

    const result = await duplicate('heroId')

    const copy = result.data.campaignBlockDuplicate[1]
    expect(copy.id).toEqual(expect.any(String))
    expect(copy.id).not.toBe('heroId')
    expect(copy.parentOrder).toBe(1)
  })

  it.each(['headerId', 'footerId'])(
    'refuses to duplicate the chrome block %s (CONFLICT, id)',
    async (id) => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, id)
      )

      const result = await duplicate(id)

      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'id'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    }
  )

  it('copies both slots of a Columns section with the section each one holds', async () => {
    const template = fixture.blocks[0]
    const row = (
      id: string,
      typename: string,
      parentBlockId: string | null,
      parentOrder: number
    ): CampaignBlockRow => ({
      ...template,
      id,
      typename,
      parentBlockId,
      parentOrder,
      pageId: 'landingPageId',
      coverBlockId: null,
      mediaBlockId: null,
      logoBlockId: null,
      action: null
    })
    const columns = [
      row('columnsId', 'CampaignColumnsBlock', null, 0),
      row('slotLeftId', 'CampaignColumnBlock', 'columnsId', 0),
      row('slotRightId', 'CampaignColumnBlock', 'columnsId', 1),
      row('slotHeroId', 'CampaignHeroBlock', 'slotLeftId', 0)
    ]
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId', columns[0])
    )
    fixture.blocks.push(...columns)
    setLive(columns)

    const result = await duplicate('columnsId', [
      { oldId: 'columnsId', newId: COLUMNS_COPY_ID },
      { oldId: 'slotLeftId', newId: SLOT_LEFT_COPY_ID },
      { oldId: 'slotRightId', newId: SLOT_RIGHT_COPY_ID },
      { oldId: 'slotHeroId', newId: SLOT_HERO_COPY_ID }
    ])

    expect(result.errors).toBeUndefined()
    expect(
      result.data.campaignBlockDuplicate
        .filter((block: { id: string }) =>
          [
            COLUMNS_COPY_ID,
            SLOT_LEFT_COPY_ID,
            SLOT_RIGHT_COPY_ID,
            SLOT_HERO_COPY_ID
          ].includes(block.id)
        )
        .map(
          (block: {
            id: string
            parentBlockId: string | null
            parentOrder: number
          }) => [block.id, block.parentBlockId, block.parentOrder]
        )
    ).toEqual([
      [COLUMNS_COPY_ID, null, 1],
      [SLOT_LEFT_COPY_ID, COLUMNS_COPY_ID, 0],
      [SLOT_RIGHT_COPY_ID, COLUMNS_COPY_ID, 1],
      [SLOT_HERO_COPY_ID, SLOT_LEFT_COPY_ID, 0]
    ])
  })

  it.each([
    ['a newId that is not a UUID', [{ oldId: 'heroId', newId: 'heroCopyId' }]],
    [
      'the same newId twice',
      [
        { oldId: 'heroId', newId: HERO_COPY_ID },
        { oldId: 'heroButtonId', newId: HERO_COPY_ID }
      ]
    ]
  ])('refuses %s (BAD_USER_INPUT, idMap)', async (_label, idMap) => {
    const result = await duplicate('heroId', idMap)

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'idMap'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('refuses to duplicate a column slot (CONFLICT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId', {
        id: 'slotId',
        typename: 'CampaignColumnBlock'
      })
    )

    const result = await duplicate('slotId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'id'
    })
  })

  it('refuses to duplicate the section inside a column slot (CONFLICT, id)', async () => {
    const template = fixture.blocks[0]
    const row = (
      id: string,
      typename: string,
      parentBlockId: string | null
    ): CampaignBlockRow => ({
      ...template,
      id,
      typename,
      parentBlockId,
      parentOrder: 0,
      pageId: 'landingPageId',
      coverBlockId: null,
      mediaBlockId: null,
      logoBlockId: null,
      action: null
    })
    const slotted = [
      row('columnsId', 'CampaignColumnsBlock', null),
      row('slotLeftId', 'CampaignColumnBlock', 'columnsId'),
      row('slotHeroId', 'CampaignHeroBlock', 'slotLeftId')
    ]
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId', slotted[2])
    )
    setLive(slotted)

    const result = await duplicate('slotHeroId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'id'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('refuses to duplicate a page (CONFLICT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
    const { team, languages, theme, pages, blocks, regions, strings, ...row } =
      fixture
    prismaMock.campaignPage.findUnique.mockResolvedValue({
      ...pages[1],
      campaign: { ...row, team }
    } as never)

    const result = await duplicate('regionPageId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'id'
    })
  })

  it('throws NOT_FOUND for an unknown or deleted block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await duplicate('gone')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId'
      )
    )

    const result = await duplicate('heroId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })
})
