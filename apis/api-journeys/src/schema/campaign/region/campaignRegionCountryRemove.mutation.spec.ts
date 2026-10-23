import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSetup'
import { campaignFactory } from '../../../../test/campaignFactory'
import { campaignRegionWithAcl } from '../../../../test/campaignRegionFactory'
import { expectStructureLockFirst } from '../../../../test/campaignStructureLock'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignRegionCountryRemove', () => {
  const REMOVE = graphql(`
    mutation CampaignRegionCountryRemove($id: ID!) {
      campaignRegionCountryRemove(id: $id) {
        id
        countryId
      }
    }
  `)

  const row = {
    id: 'eurCountry-FR',
    regionId: 'eurRegionId',
    countryId: 'FR',
    order: 0
  }

  beforeEach(() => {
    setupCampaignBlockSpec()
    const fixture = campaignFactory().withRegion('EUR').build()
    prismaMock.campaignRegionCountry.findUnique.mockResolvedValue(row)
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId')
    )
    prismaMock.campaignRegionCountry.delete.mockResolvedValue(row)
    prismaMock.campaignRegionCountry.findMany.mockResolvedValue([
      { ...row, id: 'eurCountry-DE', countryId: 'DE', order: 1 }
    ])
    prismaMock.campaignRegionCountry.update.mockResolvedValue(row)
  })

  async function remove(
    id = 'eurCountry-FR'
  ): Promise<CampaignSpecResult<typeof REMOVE>> {
    return await authClient({ document: REMOVE, variables: { id } })
  }

  it('deletes the row and renumbers the remaining chips', async () => {
    const result = await remove()

    expect(result).toEqual({
      data: {
        campaignRegionCountryRemove: { id: 'eurCountry-FR', countryId: 'FR' }
      }
    })
    expect(prismaMock.campaignRegionCountry.delete).toHaveBeenCalledWith({
      where: { id: 'eurCountry-FR' }
    })
    expect(prismaMock.campaignRegionCountry.update).toHaveBeenCalledWith({
      where: { id: 'eurCountry-DE' },
      data: { order: 0 }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('takes the structure lock before it deletes and renumbers the chips', async () => {
    await remove()

    expectStructureLockFirst()
    expect(prismaMock.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.campaignRegionCountry.delete.mock.invocationCallOrder[0]
    )
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    )

    const result = await remove()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegionCountry.delete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown row', async () => {
    prismaMock.campaignRegionCountry.findUnique.mockResolvedValue(null)

    const result = await remove('missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
