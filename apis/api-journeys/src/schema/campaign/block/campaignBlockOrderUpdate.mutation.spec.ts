import { campaignBlockWithAcl } from '../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignBlockOrderUpdate', () => {
  const ORDER_UPDATE = graphql(`
    mutation CampaignBlockOrderUpdate(
      $id: ID!
      $parentOrder: Int!
      $placement: CampaignChildPlacement
    ) {
      campaignBlockOrderUpdate(
        id: $id
        parentOrder: $parentOrder
        placement: $placement
      ) {
        id
        parentOrder
        ... on CampaignButtonBlock {
          placement
        }
        ... on CampaignTypographyBlock {
          placement
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    // Updates persist across calls, as rows do: a placement write is seen by the renumber.
    const written = new Map<string, Record<string, unknown>>()
    prismaMock.campaignBlock.update.mockImplementation((async ({
      where,
      data
    }: any) => {
      const row = {
        ...(written.get(where.id) ??
          fixture.blocks.find((block) => block.id === where.id)),
        ...data
      }
      written.set(where.id, row)
      return row
    }) as never)
  })

  async function move(
    id: string,
    parentOrder: number,
    placement?: string
  ): Promise<any> {
    return await authClient({
      document: ORDER_UPDATE,
      variables: { id, parentOrder, placement }
    })
  }

  function landingSections(): CampaignFixture['blocks'] {
    return fixture.blocks.filter(
      (block) => block.pageId === 'landingPageId' && block.parentBlockId == null
    )
  }

  it('moves a section to the given position and renumbers the page’s sections contiguously', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue(landingSections())

    const result = await move('heroId', 2)

    expect(result).toEqual({
      data: {
        campaignBlockOrderUpdate: [
          { id: 'landingSwitcherId', parentOrder: 0 },
          { id: 'carouselId', parentOrder: 1 },
          { id: 'heroId', parentOrder: 2 },
          { id: 'landingJourneyListId', parentOrder: 3 },
          { id: 'landingAnalyticsId', parentOrder: 4 }
        ]
      }
    })
    expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          parentBlockId: null,
          pageId: 'landingPageId',
          regionId: null,
          deletedAt: null
        })
      })
    )
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ placement: expect.anything() }) })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('moves a block last when the position is past the end', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue(landingSections())

    const result = await move('heroId', 99)

    expect(
      result.data.campaignBlockOrderUpdate.map((block: any) => block.id)
    ).toEqual([
      'landingSwitcherId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId',
      'heroId'
    ])
  })

  it('updates placement when an Extra moves across the Section Body', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerPrivacyId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter((block) => block.parentBlockId === 'footerId')
    )

    const result = await move('footerPrivacyId', 0, 'above')

    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'footerPrivacyId' },
      data: { placement: 'above' }
    })
    expect(result.data.campaignBlockOrderUpdate).toEqual([
      { id: 'footerPrivacyId', parentOrder: 0, placement: 'above' },
      { id: 'footerCopyrightId', parentOrder: 1, placement: 'below' },
      { id: 'footerTermsId', parentOrder: 2, placement: 'below' }
    ])
  })

  it('leaves placement alone when an Extra moves among its neighbours', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerPrivacyId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter((block) => block.parentBlockId === 'footerId')
    )

    const result = await move('footerPrivacyId', 1)

    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ placement: expect.anything() })
      })
    )
    expect(
      result.data.campaignBlockOrderUpdate.map((block: any) => [
        block.id,
        block.parentOrder,
        block.placement
      ])
    ).toEqual([
      ['footerCopyrightId', 0, 'below'],
      ['footerPrivacyId', 1, 'below'],
      ['footerTermsId', 2, 'below']
    ])
  })

  it('rejects placement on a block that is not a section child (BAD_USER_INPUT, placement)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await move('heroId', 1, 'above')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'placement'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('rejects a negative position (BAD_USER_INPUT, parentOrder)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await move('heroId', -1)

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentOrder'
    })
  })

  it.each(['headerId', 'footerId'])(
    'refuses to move the chrome block %s (CONFLICT, id)',
    async (id) => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, id)
      )

      const result = await move(id, 1)

      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'id'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    }
  )

  it('refuses to move a column slot (CONFLICT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId', {
        id: 'slotId',
        typename: 'CampaignColumnBlock'
      })
    )

    const result = await move('slotId', 1)

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'id'
    })
  })

  it('refuses to move a page (CONFLICT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
    const { team, languages, theme, pages, blocks, regions, strings, ...row } =
      fixture
    prismaMock.campaignPage.findUnique.mockResolvedValue({
      ...pages[0],
      campaign: { ...row, team }
    } as never)

    const result = await move('landingPageId', 1)

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'id'
    })
  })

  it('throws NOT_FOUND for an unknown or deleted block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await move('gone', 1)

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId'
      )
    )

    const result = await move('heroId', 1)

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
