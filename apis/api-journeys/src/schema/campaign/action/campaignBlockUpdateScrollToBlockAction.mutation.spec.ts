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

import { mockActionUpsert } from './campaignBlockUpdateLinkAction.mutation.spec'

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
      .mockResolvedValueOnce(target)
  }

  async function update(blockId: string, id = 'footerTermsId'): Promise<any> {
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
      where: { id: 'carouselId', campaignId: 'campaignId', deletedAt: null },
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
