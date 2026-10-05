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

describe('campaignBlockDeleteAction', () => {
  const DELETE = graphql(`
    mutation CampaignBlockDeleteAction($id: ID!) {
      campaignBlockDeleteAction(id: $id) {
        id
        label
        action {
          __typename
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )
    prismaMock.campaignAction.deleteMany.mockResolvedValue({ count: 1 })
  })

  async function remove(id = 'heroButtonId'): Promise<any> {
    return await authClient({ document: DELETE, variables: { id } })
  }

  it('removes the action row and returns the button with no action', async () => {
    const result = await remove()

    expect(result).toEqual({
      data: {
        campaignBlockDeleteAction: {
          id: 'heroButtonId',
          label: 'Choose your region',
          action: null
        }
      }
    })
    expect(prismaMock.campaignAction.deleteMany).toHaveBeenCalledWith({
      where: { campaignBlockId: 'heroButtonId' }
    })
    expect(prismaMock.campaignAction.findUnique).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('refuses a block that is not a CampaignButtonBlock (BAD_USER_INPUT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerCopyrightId')
    )

    const result = await remove('footerCopyrightId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignAction.deleteMany).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the id is not a live block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await remove('ghostId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroButtonId'
      )
    )

    const result = await remove()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignAction.deleteMany).not.toHaveBeenCalled()
  })
})
