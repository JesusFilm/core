import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { authClient, mockUser } from '../../../test/campaignBlockSpec'
import { campaignFactory } from '../../../test/campaignFactory'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { deleteShortLink } from '../qrCode/qrCode.service'

import { fetchLanguage } from './gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../qrCode/qrCode.service')>()),
  deleteShortLink: vi.fn()
}))

vi.mock('./gatewayClient', () => ({ fetchLanguage: vi.fn() }))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignDelete', () => {
  const CAMPAIGN_DELETE = graphql(`
    mutation CampaignDelete($id: ID!) {
      campaignDelete(id: $id) {
        id
        slug
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([])
  })

  it('hard-deletes the campaign row for a manager, relying on the cascade for the rest', async () => {
    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: { campaignDelete: { id: 'campaignId', slug: 'christmas-2026' } }
    })
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
    // One delete; blocks, actions, pages, languages, theme, strings and
    // regions go with the row through the schema's onDelete: Cascade.
    expect(prismaMock.campaignBlock.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegion.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignPage.deleteMany).not.toHaveBeenCalled()
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
  })

  it("deletes every Share Language's QR row and short link before the campaign", async () => {
    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([
      { qrCode: { id: 'qrCodeA', shortLinkId: 'shortLinkA' } },
      { qrCode: { id: 'qrCodeB', shortLinkId: 'shortLinkB' } }
    ] as never)

    const result = (await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.findMany).toHaveBeenCalledWith({
      where: { region: { campaignId: 'campaignId' }, qrCodeId: { not: null } },
      select: { qrCode: { select: { id: true, shortLinkId: true } } }
    })
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkA')
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkB')
    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['qrCodeA', 'qrCodeB'] } }
    })
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('leaves an attached Custom Domain to the SetNull foreign key: no domain row is written', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      customDomains: [{ id: 'customDomainId', name: 'christmas.example.org' }]
    } as any)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(prismaMock.campaign.delete).toHaveBeenCalledTimes(1)
    expect(prismaMock.customDomain.update).not.toHaveBeenCalled()
    expect(prismaMock.customDomain.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
  })

  it('revalidates every page of a published campaign, domain root and _lang pages included, once the delete committed', async () => {
    const published = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...published,
      customDomains: [{ id: 'customDomainId', name: 'christmas.example.org' }]
    } as any)
    prismaMock.campaign.delete.mockResolvedValue(published)
    prismaMock.campaignLanguage.findMany.mockResolvedValue([
      { languageId: '529' },
      { languageId: '21028' }
    ] as any)
    vi.mocked(fetchLanguage)
      .mockResolvedValueOnce({ id: '529', bcp47: 'en' })
      .mockResolvedValueOnce({ id: '21028', bcp47: 'es' })

    const result = (await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/christmas-2026',
      '/home/campaign/christmas-2026/eur',
      '/home/campaign/christmas-2026/_lang/en',
      '/home/campaign/christmas-2026/_lang/en/eur',
      '/home/campaign/christmas-2026/_lang/es',
      '/home/campaign/christmas-2026/_lang/es/eur',
      '/christmas.example.org',
      '/christmas.example.org/eur',
      '/christmas.example.org/_lang/en',
      '/christmas.example.org/_lang/en/eur',
      '/christmas.example.org/_lang/es',
      '/christmas.example.org/_lang/es/eur'
    ])
  })

  it('queues nothing for a draft campaign', async () => {
    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(prismaMock.campaign.delete).toHaveBeenCalledTimes(1)
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('queues nothing when the delete fails', async () => {
    const published = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    prismaMock.campaign.delete.mockRejectedValue(new Error('delete failed'))

    const result = (await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors[0].message).toBe('delete failed')
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a member', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete campaign',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'campaign not found',
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled()
  })
})
