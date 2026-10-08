import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import { campaignFactory } from '../../../../test/campaignFactory'
import { campaignRegionWithAcl } from '../../../../test/campaignRegionFactory'
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
    prismaMock.campaignRegionCountry.findUnique.mockResolvedValue({
      ...row,
      region: campaignRegionWithAcl(fixture, 'eurRegionId')
    } as never)
    prismaMock.campaignRegionCountry.delete.mockResolvedValue(row)
    prismaMock.campaignRegionCountry.findMany.mockResolvedValue([
      { ...row, id: 'eurCountry-DE', countryId: 'DE', order: 1 }
    ])
    prismaMock.campaignRegionCountry.update.mockResolvedValue(row)
  })

  async function remove(id = 'eurCountry-FR'): Promise<any> {
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

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegionCountry.findUnique.mockResolvedValue({
      ...row,
      region: campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    } as never)

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
