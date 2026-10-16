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

describe('campaignJourneyListBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignJourneyListBlockUpdate(
      $id: ID!
      $input: CampaignJourneyListBlockUpdateInput!
    ) {
      campaignJourneyListBlockUpdate(id: $id, input: $input) {
        id
        eyebrow
        title
        lede
        display
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'landingJourneyListId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'landingJourneyListId', input }
    })
  }

  it.each([
    ['eyebrow', 80],
    ['title', 150],
    ['lede', 500]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: ' ' + 'x'.repeat(max) + ' ' })
      expect(ok.errors).toBeUndefined()
      expect(ok.data.campaignJourneyListBlockUpdate[field]).toBe(
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
    const field = 'lede'
    const result = await update({ [field]: '' })

    expect(result.data.campaignJourneyListBlockUpdate[field]).toBe('')
  })

  it('takes display grid or list', async () => {
    for (const display of ['grid', 'list']) {
      const result = await update({ display })
      expect(result.data.campaignJourneyListBlockUpdate.display).toBe(display)
    }
  })

  it('throws NOT_FOUND when the id is not a live CampaignJourneyListBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ lede: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
