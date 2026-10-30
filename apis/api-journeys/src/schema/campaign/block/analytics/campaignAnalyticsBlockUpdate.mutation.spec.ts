import { campaignBlockWithAcl } from '../../../../../test/campaignBlockAcl'
import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSetup'
import { mockCampaignBlockWrites } from '../../../../../test/campaignBlockWrites'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
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
    mockCampaignBlockWrites(block)
  })

  async function update(
    input: Record<string, unknown>
  ): Promise<CampaignSpecResult<typeof UPDATE>> {
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

      expect(result.errors?.[0].extensions).toMatchObject({
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

  it('refuses showMap: null (BAD_USER_INPUT, showMap) and leaves an omitted showMap alone', async () => {
    const nulled = await update({ showMap: null })

    expect(nulled.errors?.[0]).toMatchObject({
      message: 'showMap cannot be null',
      extensions: { code: 'BAD_USER_INPUT', field: 'showMap' }
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()

    const omitted = await update({ title: 'Reach' })

    expect(omitted.errors).toBeUndefined()
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { title: 'Reach' } })
    )
    expect(
      prismaMock.campaignBlock.update.mock.calls[0][0].data.showMap
    ).toBeUndefined()
  })

  it('throws NOT_FOUND when the id is not a live CampaignAnalyticsBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ title: 'x' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'landingAnalyticsId'
      )
    )

    const result = await update({ title: 'x' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
