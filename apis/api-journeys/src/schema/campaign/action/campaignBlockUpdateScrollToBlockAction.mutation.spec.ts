import { mockActionUpsert } from '../../../../test/campaignActionMock'
import { campaignBlockWithAcl } from '../../../../test/campaignBlockAcl'
import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSetup'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignBlockUpdateScrollToBlockAction', () => {
  const UPDATE = graphql(`
    mutation CampaignBlockUpdateScrollToBlockAction(
      $id: ID!
      $input: CampaignScrollToBlockActionInput!
    ) {
      campaignBlockUpdateScrollToBlockAction(id: $id, input: $input) {
        __typename
        parentBlockId
        blockId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    mockActionUpsert()
  })

  function mockButton(blockId: string, target: { id: string } | null): void {
    prismaMock.campaignBlock.findFirst
      .mockResolvedValueOnce(campaignBlockWithAcl(fixture, blockId))
      .mockResolvedValueOnce(target as never)
  }

  async function update(
    blockId: string,
    id = 'footerTermsId'
  ): Promise<CampaignSpecResult<typeof UPDATE>> {
    return await authClient({
      document: UPDATE,
      variables: { id, input: { blockId } }
    })
  }

  it('replaces the button’s link with a scroll to a live block of the same campaign', async () => {
    mockButton('footerTermsId', { id: 'carouselId' })

    const result = await update('carouselId')

    expect(result).toEqual({
      data: {
        campaignBlockUpdateScrollToBlockAction: {
          __typename: 'CampaignScrollToBlockAction',
          parentBlockId: 'footerTermsId',
          blockId: 'carouselId'
        }
      }
    })
    expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith({
      where: {
        id: 'carouselId',
        campaignId: 'campaignId',
        deletedAt: null,
        parentBlockId: null,
        parentOrder: { not: null },
        pageId: { not: null }
      },
      select: { id: true }
    })
    expect(prismaMock.campaignAction.upsert).toHaveBeenCalledWith({
      where: { campaignBlockId: 'footerTermsId' },
      create: { campaignBlockId: 'footerTermsId', blockId: 'carouselId' },
      update: {
        blockId: 'carouselId',
        regionId: null,
        url: null,
        target: null
      }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  describe('the target is a top-level section on the button’s page', () => {
    it('limits a page button to sections of its own page', async () => {
      mockButton('heroButtonId', { id: 'landingJourneyListId' })

      const result = await update('landingJourneyListId', 'heroButtonId')

      expect(result.errors).toBeUndefined()
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith({
        where: {
          id: 'landingJourneyListId',
          campaignId: 'campaignId',
          deletedAt: null,
          parentBlockId: null,
          parentOrder: { not: null },
          pageId: 'landingPageId'
        },
        select: { id: true }
      })
    })

    it.each([
      ['an Extra', 'heroButtonId'],
      ['an owned block', 'heroCoverId'],
      ['the header', 'headerId'],
      ['a section of the other page', 'regionHeaderId']
    ])(
      'refuses %s for a page button (BAD_USER_INPUT, blockId)',
      async (_label, targetId) => {
        mockButton('heroButtonId', null)

        const result = await update(targetId, 'heroButtonId')

        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'blockId'
        })
        expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith({
          where: expect.objectContaining({
            id: targetId,
            parentBlockId: null,
            parentOrder: { not: null },
            pageId: 'landingPageId'
          }),
          select: { id: true }
        })
        expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
      }
    )

    it('lets a header or footer button target a section of either page', async () => {
      mockButton('footerTermsId', { id: 'regionHeaderId' })

      const result = await update('regionHeaderId')

      expect(result.errors).toBeUndefined()
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith({
        where: expect.objectContaining({
          id: 'regionHeaderId',
          parentBlockId: null,
          parentOrder: { not: null },
          pageId: { not: null }
        }),
        select: { id: true }
      })
    })
  })

  it('rejects a target that is deleted, of another campaign or unknown (BAD_USER_INPUT, blockId)', async () => {
    mockButton('footerTermsId', null)

    const result = await update('ghostId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'blockId'
    })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })

  it('refuses a block that is not a CampaignButtonBlock (BAD_USER_INPUT, id)', async () => {
    mockButton('footerCopyrightId', { id: 'carouselId' })

    const result = await update('carouselId', 'footerCopyrightId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'footerTermsId'
      )
    )

    const result = await update('carouselId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })
})
