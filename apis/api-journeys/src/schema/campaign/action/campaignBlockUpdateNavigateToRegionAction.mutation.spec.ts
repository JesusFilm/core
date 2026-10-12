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

describe('campaignBlockUpdateNavigateToRegionAction', () => {
  const UPDATE = graphql(`
    mutation CampaignBlockUpdateNavigateToRegionAction(
      $id: ID!
      $input: CampaignNavigateToRegionActionInput!
    ) {
      campaignBlockUpdateNavigateToRegionAction(id: $id, input: $input) {
        __typename
        parentBlockId
        regionId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )
    mockActionUpsert()
  })

  async function update(regionId: string, id = 'heroButtonId'): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id, input: { regionId } }
    })
  }

  it('replaces the button’s scroll with a navigation to a region of the same campaign', async () => {
    prismaMock.campaignRegion.findFirst.mockResolvedValue({
      id: 'eurRegionId'
    } as never)

    const result = await update('eurRegionId')

    expect(result).toEqual({
      data: {
        campaignBlockUpdateNavigateToRegionAction: {
          __typename: 'CampaignNavigateToRegionAction',
          parentBlockId: 'heroButtonId',
          regionId: 'eurRegionId'
        }
      }
    })
    expect(prismaMock.campaignRegion.findFirst).toHaveBeenCalledWith({
      where: { id: 'eurRegionId', campaignId: 'campaignId' },
      select: { id: true }
    })
    expect(prismaMock.campaignAction.upsert).toHaveBeenCalledWith({
      where: { campaignBlockId: 'heroButtonId' },
      create: { campaignBlockId: 'heroButtonId', regionId: 'eurRegionId' },
      update: {
        blockId: null,
        regionId: 'eurRegionId',
        url: null,
        target: null
      }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('rejects a region of another campaign or unknown (BAD_USER_INPUT, regionId)', async () => {
    prismaMock.campaignRegion.findFirst.mockResolvedValue(null)

    const result = await update('otherRegionId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'regionId'
    })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })

  it('refuses a block that is not a CampaignButtonBlock (BAD_USER_INPUT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await update('eurRegionId', 'heroId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignRegion.findFirst).not.toHaveBeenCalled()
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroButtonId'
      )
    )

    const result = await update('eurRegionId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })
})
