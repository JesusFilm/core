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

describe('campaignRegionShareBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignRegionShareBlockUpdate(
      $id: ID!
      $input: CampaignRegionShareBlockUpdateInput!
    ) {
      campaignRegionShareBlockUpdate(id: $id, input: $input) {
        id
        title
        intro
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'regionShareId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'regionShareId', input }
    })
  }

  it.each([
    ['title', 150],
    ['intro', 500]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: ' ' + 'x'.repeat(max) + ' ' })
      expect(ok.errors).toBeUndefined()
      expect(ok.data.campaignRegionShareBlockUpdate[field]).toBe(
        'x'.repeat(max)
      )

      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('allows empty text', async () => {
    const field = 'intro'
    const result = await update({ [field]: '' })

    expect(result.data.campaignRegionShareBlockUpdate[field]).toBe('')
  })

  it('throws NOT_FOUND when the id is not a live CampaignRegionShareBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ intro: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
