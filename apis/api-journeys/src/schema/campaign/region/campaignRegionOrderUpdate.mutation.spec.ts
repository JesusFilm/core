import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionWithAcl } from '../../../../test/campaignRegionFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignRegionOrderUpdate', () => {
  const ORDER_UPDATE = graphql(`
    mutation CampaignRegionOrderUpdate($id: ID!, $order: Int!) {
      campaignRegionOrderUpdate(id: $id, order: $order) {
        id
        order
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory()
      .withRegion('EUR')
      .withRegion('AFR')
      .withRegion('LAC')
      .build()
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId')
    )
    prismaMock.campaignRegion.findMany.mockResolvedValue(fixture.regions)
    prismaMock.campaignRegion.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.regions.find((region) => region.id === where.id),
      ...data
    })) as never)
  })

  async function move(order: number, id = 'eurRegionId'): Promise<any> {
    return await authClient({
      document: ORDER_UPDATE,
      variables: { id, order }
    })
  }

  it('moves the region and renumbers every region contiguously', async () => {
    const result = await move(2)

    expect(result).toEqual({
      data: {
        campaignRegionOrderUpdate: [
          { id: 'afrRegionId', order: 0 },
          { id: 'lacRegionId', order: 1 },
          { id: 'eurRegionId', order: 2 }
        ]
      }
    })
    expect(prismaMock.campaignRegion.findMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId' },
      orderBy: { order: 'asc' }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('clamps a position past the end to last', async () => {
    const result = await move(10)

    expect(
      result.data.campaignRegionOrderUpdate.map((region: any) => region.id)
    ).toEqual(['afrRegionId', 'lacRegionId', 'eurRegionId'])
  })

  it('rejects a negative order (BAD_USER_INPUT, field order)', async () => {
    const result = await move(-1)

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'order'
    })
    expect(prismaMock.campaignRegion.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    )

    const result = await move(1)

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws NOT_FOUND for an unknown region', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(null)

    const result = await move(1, 'missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
