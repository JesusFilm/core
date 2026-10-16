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

describe('campaignAnalyticsBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignAnalyticsBlockUpdate(
      $id: ID!
      $input: CampaignAnalyticsBlockUpdateInput!
    ) {
      campaignAnalyticsBlockUpdate(id: $id, input: $input) {
        id
        eyebrow
        title
        showMap
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'landingAnalyticsId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'landingAnalyticsId', input }
    })
  }

  it.each([
    ['eyebrow', 80],
    ['title', 150]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: ' ' + 'x'.repeat(max) + ' ' })
      expect(ok.errors).toBeUndefined()
      expect(ok.data.campaignAnalyticsBlockUpdate[field]).toBe('x'.repeat(max))

      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('allows empty text', async () => {
    const field = 'title'
    const result = await update({ [field]: '' })

    expect(result.data.campaignAnalyticsBlockUpdate[field]).toBe('')
  })

  it('toggles showMap', async () => {
    const result = await update({ showMap: false })
    expect(result.data.campaignAnalyticsBlockUpdate.showMap).toBe(false)
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { showMap: false } })
    )
  })

  it('throws NOT_FOUND when the id is not a live CampaignAnalyticsBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
