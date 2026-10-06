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
      { oldId: 'heroId', newId: 'heroCopyId' },
      { oldId: 'heroButtonId', newId: 'heroButtonCopyId' }
    ])

    expect(result.data.campaignBlockDuplicate).toEqual([
      {
        id: 'heroId',
        parentBlockId: null,
        parentOrder: 0,
        title: 'Share the story of Christmas',
        mediaBlockId: null
      },
      {
        id: 'heroCopyId',
        parentBlockId: null,
        parentOrder: 1,
        title: 'Share the story of Christmas',
        mediaBlockId: null
      },
      { id: 'landingSwitcherId', parentBlockId: null, parentOrder: 2 },
      { id: 'carouselId', parentBlockId: null, parentOrder: 3 },
      { id: 'landingJourneyListId', parentBlockId: null, parentOrder: 4 },
      { id: 'landingAnalyticsId', parentBlockId: null, parentOrder: 5 },
      {
        id: 'heroButtonCopyId',
        parentBlockId: 'heroCopyId',
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
        id: 'heroCopyId',
        typename: 'CampaignHeroBlock',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: null,
        parentOrder: 5,
        eyebrow: 'Christmas 2026',
        align: 'center'
      }),
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        id: 'heroButtonCopyId',
        typename: 'CampaignButtonBlock',
        parentBlockId: 'heroCopyId',
        parentOrder: 0,
        placement: 'below'
      }),
      include: { action: true }
    })
    // The action is recreated on the copy, pointing at the same target outside the copy.
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroButtonCopyId' },
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
      { oldId: 'heroId', newId: 'heroCopyId' },
      { oldId: 'heroMediaId', newId: 'heroMediaCopyId' },
      { oldId: 'heroButtonId', newId: 'heroButtonCopyId' }
    ])

    expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'heroMediaCopyId',
        typename: 'CampaignTypographyBlock',
        parentBlockId: 'heroCopyId',
        parentOrder: null,
        content: 'poster'
      }),
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroCopyId' },
      data: { mediaBlockId: 'heroMediaCopyId' },
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroButtonCopyId' },
      data: {
        action: {
          create: {
            blockId: 'heroCopyId',
            regionId: null,
            url: null,
            target: null
          }
        }
      },
      include: { action: true }
    })
    const ids = result.data.campaignBlockDuplicate.map((block: any) => block.id)
    expect(ids).toContain('heroMediaCopyId')
    expect(ids).toContain('heroButtonCopyId')
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
      { oldId: 'columnsId', newId: 'columnsCopyId' },
      { oldId: 'slotLeftId', newId: 'slotLeftCopyId' },
      { oldId: 'slotRightId', newId: 'slotRightCopyId' },
      { oldId: 'slotHeroId', newId: 'slotHeroCopyId' }
    ])

    expect(result.errors).toBeUndefined()
    expect(
      result.data.campaignBlockDuplicate
        .filter((block: { id: string }) => block.id.endsWith('CopyId'))
        .map(
          (block: {
            id: string
            parentBlockId: string | null
            parentOrder: number
          }) => [block.id, block.parentBlockId, block.parentOrder]
        )
    ).toEqual([
      ['columnsCopyId', null, 1],
      ['slotLeftCopyId', 'columnsCopyId', 0],
      ['slotRightCopyId', 'columnsCopyId', 1],
      ['slotHeroCopyId', 'slotLeftCopyId', 0]
    ])
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
