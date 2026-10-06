import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import { CampaignFixture } from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignColumnsBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignColumnsBlockUpdate(
      $id: ID!
      $input: CampaignColumnsBlockUpdateInput!
    ) {
      campaignColumnsBlockUpdate(id: $id, input: $input) {
        id
        ratio
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'heroId', {
      id: 'columnsId',
      typename: 'CampaignColumnsBlock',
      ratio: 'equal'
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'columnsId', input }
    })
  }

  it.each(['equal', 'wideLeft', 'wideRight'])(
    'sets the ratio to %s',
    async (ratio) => {
      const result = await update({ ratio })

      expect(result).toEqual({
        data: { campaignColumnsBlockUpdate: { id: 'columnsId', ratio } }
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'columnsId' },
        data: { ratio },
        include: { action: true }
      })
    }
  )

  it('rejects a ratio outside the enum (BAD_USER_INPUT)', async () => {
    const result = await update({ ratio: 'tall' })

    expect(result.errors).toBeDefined()
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the id is not a live CampaignColumnsBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ ratio: 'wideLeft' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
