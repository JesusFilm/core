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

describe('campaignRegionSwitcherBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignRegionSwitcherBlockUpdate(
      $id: ID!
      $input: CampaignRegionSwitcherBlockUpdateInput!
    ) {
      campaignRegionSwitcherBlockUpdate(id: $id, input: $input) {
        id
        title
        variant
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'landingSwitcherId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'landingSwitcherId', input }
    })
  }

  it.each([['title', 150]])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: ' ' + 'x'.repeat(max) + ' ' })
      expect(ok.errors).toBeUndefined()
      expect(ok.data.campaignRegionSwitcherBlockUpdate[field]).toBe(
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
    const field = 'title'
    const result = await update({ [field]: '' })

    expect(result.data.campaignRegionSwitcherBlockUpdate[field]).toBe('')
  })

  it('takes variant cards, list or pills', async () => {
    for (const variant of ['cards', 'list', 'pills']) {
      const result = await update({ variant })
      expect(result.data.campaignRegionSwitcherBlockUpdate.variant).toBe(
        variant
      )
      expect(prismaMock.campaignBlock.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { switcherVariant: variant } })
      )
    }
  })

  it('throws NOT_FOUND when the id is not a live CampaignRegionSwitcherBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
