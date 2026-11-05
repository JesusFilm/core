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
        showCountryNames
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'landingSwitcherId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    mockCampaignBlockWrites(block)
  })

  async function update(
    input: Record<string, unknown>
  ): Promise<CampaignSpecResult<typeof UPDATE>> {
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

      expect(result.errors?.[0].extensions).toMatchObject({
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

  it.each([false, true])(
    'stores showCountryNames %s on this section alone',
    async (showCountryNames) => {
      const result = await update({ showCountryNames })

      expect(result.errors).toBeUndefined()
      expect(
        result.data.campaignRegionSwitcherBlockUpdate.showCountryNames
      ).toBe(showCountryNames)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'landingSwitcherId' },
        data: { showCountryNames },
        include: { action: true }
      })
    }
  )

  it('reads a legacy null showCountryNames as true', async () => {
    const result = await update({ title: 'Regions' })

    expect(result.data.campaignRegionSwitcherBlockUpdate.showCountryNames).toBe(
      true
    )
  })

  it('refuses showCountryNames: null (BAD_USER_INPUT, showCountryNames) and leaves an omitted one alone', async () => {
    const nulled = await update({ showCountryNames: null })

    expect(nulled.errors?.[0]).toMatchObject({
      message: 'showCountryNames cannot be null',
      extensions: { code: 'BAD_USER_INPUT', field: 'showCountryNames' }
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()

    const hidden = campaignBlockWithAcl(fixture, 'landingSwitcherId', {
      showCountryNames: false
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(hidden)
    mockCampaignBlockWrites(hidden)
    const omitted = await update({ title: 'Regions', variant: 'pills' })

    expect(omitted.errors).toBeUndefined()
    expect(
      prismaMock.campaignBlock.update.mock.calls[0][0].data.showCountryNames
    ).toBeUndefined()
    expect(
      omitted.data.campaignRegionSwitcherBlockUpdate.showCountryNames
    ).toBe(false)
  })

  it('throws NOT_FOUND when the id is not a live CampaignRegionSwitcherBlock', async () => {
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
        'landingSwitcherId'
      )
    )

    const result = await update({ title: 'x' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
