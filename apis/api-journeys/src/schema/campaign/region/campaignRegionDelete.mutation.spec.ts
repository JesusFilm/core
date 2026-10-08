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
import { deleteShortLink } from '../../qrCode/qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../qrCode/qrCode.service')>()),
  deleteShortLink: vi.fn()
}))

const { mockQueueAdd } = vi.hoisted(() => ({ mockQueueAdd: vi.fn() }))

vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: mockQueueAdd }
  })
}))

describe('campaignRegionDelete', () => {
  const DELETE = graphql(`
    mutation CampaignRegionDelete($id: ID!) {
      campaignRegionDelete(id: $id) {
        id
        slug
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    mockQueueAdd.mockResolvedValue(undefined)
    fixture = campaignFactory().withRegion('EUR').withRegion('AFR').build()
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId', { listed: false })
    )
    prismaMock.campaignRegion.delete.mockResolvedValue(fixture.regions[0])
    prismaMock.campaignRegion.findMany.mockResolvedValue([fixture.regions[1]])
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([])
    prismaMock.campaignRegion.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.regions.find((region) => region.id === where.id),
      ...data
    })) as never)
  })

  async function remove(id = 'eurRegionId'): Promise<any> {
    return await authClient({ document: DELETE, variables: { id } })
  }

  it('hard-deletes an unlisted region in one delete, leaving languages, countries, lines and actions to the schema', async () => {
    const result = await remove()

    expect(result).toEqual({
      data: { campaignRegionDelete: { id: 'eurRegionId', slug: 'eur' } }
    })
    expect(prismaMock.campaignRegion.delete).toHaveBeenCalledWith({
      where: { id: 'eurRegionId' }
    })
    // One delete: CampaignRegionLanguage, CampaignRegionCountry and the
    // region's lines cascade; CampaignAction.regionId is set null; the
    // linked journeys are not touched.
    expect(prismaMock.campaignRegionLanguage.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionCountry.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignBlock.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignBlock.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignAction.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
    expect(prismaMock.journey.delete).not.toHaveBeenCalled()
    expect(prismaMock.campaignPage.delete).not.toHaveBeenCalled()
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
  })

  it("deletes every owned QR row's short link and row before the region", async () => {
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([
      { qrCode: { id: 'qrCodeA', shortLinkId: 'shortLinkA' } },
      { qrCode: { id: 'qrCodeB', shortLinkId: 'shortLinkB' } }
    ] as never)

    const result = await remove()

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.findMany).toHaveBeenCalledWith({
      where: { regionId: 'eurRegionId', qrCodeId: { not: null } },
      select: { qrCode: { select: { id: true, shortLinkId: true } } }
    })
    expect(deleteShortLink).toHaveBeenCalledTimes(2)
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkA')
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkB')
    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['qrCodeA', 'qrCodeB'] } }
    })
    expect(prismaMock.campaignRegion.delete).toHaveBeenCalledWith({
      where: { id: 'eurRegionId' }
    })
  })

  it('renumbers the remaining regions contiguously', async () => {
    await remove()

    expect(prismaMock.campaignRegion.update).toHaveBeenCalledWith({
      where: { id: 'afrRegionId' },
      data: { order: 0 }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('refuses a listed region (CONFLICT, field regionId)', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId')
    )

    const result = await remove()

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'regionId'
    })
    expect(prismaMock.campaignRegion.delete).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND for the Region Page itself, which is not a region', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(null)

    const result = await remove('regionPageId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignRegion.delete).not.toHaveBeenCalled()
    expect(prismaMock.campaignPage.delete).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId',
        { listed: false }
      )
    )

    const result = await remove()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegion.delete).not.toHaveBeenCalled()
  })

  it('revalidates the landing page and the deleted path of a published campaign', async () => {
    const published = campaignFactory()
      .withRegion('EUR')
      .withRegion('AFR')
      .published()
      .build()
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(published, 'eurRegionId', { listed: false })
    )

    await remove()

    const paths = mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])
    expect(paths).toEqual([
      '/home/campaign/christmas-2026',
      '/home/campaign/christmas-2026/eur'
    ])
  })

  it('queues no revalidation for a draft campaign', async () => {
    await remove()

    expect(mockQueueAdd).not.toHaveBeenCalled()
  })
})
