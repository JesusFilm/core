import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { authClient, mockUser } from '../../../test/campaignBlockSetup'
import { campaignFactory } from '../../../test/campaignFactory'
import {
  CampaignWriteCall,
  fakeCampaignWrite
} from '../../../test/campaignWrite'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { deleteVercelDomain } from '../customDomain/service'
import { logger } from '../logger'
import { deleteShortLink } from '../qrCode/qrCode.service'

import { fetchLanguage } from './gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./campaignWrite', () => ({ campaignWrite: vi.fn() }))

vi.mock('../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../qrCode/qrCode.service')>()),
  deleteShortLink: vi.fn()
}))

vi.mock('../customDomain/service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../customDomain/service')>()),
  deleteVercelDomain: vi.fn().mockResolvedValue(true)
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

  let writes: CampaignWriteCall[]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    writes = fakeCampaignWrite(prismaMock)
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
      data: { campaignDelete: { id: 'campaignId', slug: 'outreach-2026' } }
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
    // No touch: the Campaign row is gone. The short link deletes, the
    // revalidation and the Vercel removal wait for the commit.
    expect(writes).toEqual([
      {
        campaignId: 'campaignId',
        declaration: { touch: false },
        jobs: [
          expect.any(Function),
          expect.any(Function),
          expect.any(Function)
        ],
        touched: false
      }
    ])
  })

  it("deletes every Share Language's QR row before the campaign and queues its short link delete", async () => {
    const campaign = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([
      { qrCode: { id: 'qrCodeA', shortLinkId: 'shortLinkA' } },
      { qrCode: { id: 'qrCodeB', shortLinkId: 'shortLinkB' } }
    ] as never)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.findMany).toHaveBeenCalledWith({
      where: { region: { campaignId: 'campaignId' }, qrCodeId: { not: null } },
      select: { qrCode: { select: { id: true, shortLinkId: true } } }
    })
    // The short links go on the retried delete queue, not straight to the gateway.
    expect(
      mockQueueAdd.mock.calls
        .filter(([name]) => name === 'api-journeys-shortlink-delete-job')
        .map(([, data]) => data.shortLinkId)
    ).toEqual(['shortLinkA', 'shortLinkB'])
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['qrCodeA', 'qrCodeB'] } }
    })
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('leaves its Campaign Domain row to the cascade and removes it from Vercel after the commit', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      customDomains: [{ id: 'customDomainId', name: 'outreach.example.org' }]
    } as any)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaign.delete).toHaveBeenCalledTimes(1)
    expect(prismaMock.customDomain.delete).not.toHaveBeenCalled()
    expect(deleteVercelDomain).toHaveBeenCalledWith('outreach.example.org')
    // Not lock order: Vercel hears of the delete only once the row is gone.
    expect(
      vi.mocked(deleteVercelDomain).mock.invocationCallOrder[0]
    ).toBeGreaterThan(prismaMock.campaign.delete.mock.invocationCallOrder[0])
  })

  it('logs a Vercel failure and still returns the deleted campaign', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      customDomains: [{ id: 'customDomainId', name: 'outreach.example.org' }]
    } as any)
    prismaMock.campaign.delete.mockResolvedValue(campaign)
    vi.mocked(deleteVercelDomain).mockRejectedValueOnce(
      new Error('vercel response not handled')
    )
    const errorSpy = vi
      .spyOn(logger, 'error')
      .mockImplementation(() => undefined)

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: { campaignDelete: { id: 'campaignId', slug: 'outreach-2026' } }
    })
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: 'campaignId',
        name: 'outreach.example.org'
      }),
      'Failed to delete campaign domain from Vercel'
    )
    errorSpy.mockRestore()
  })

  it('touches Vercel for no campaign without a domain', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.delete.mockResolvedValue(campaign)

    await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(deleteVercelDomain).not.toHaveBeenCalled()
  })

  it('revalidates every page of a published campaign, domain root and _lang pages included, once the delete committed', async () => {
    const published = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...published,
      customDomains: [{ id: 'customDomainId', name: 'outreach.example.org' }]
    } as any)
    prismaMock.campaign.delete.mockResolvedValue(published)
    prismaMock.campaignLanguage.findMany.mockResolvedValue([
      { languageId: '529' },
      { languageId: '21028' }
    ] as any)
    vi.mocked(fetchLanguage)
      .mockResolvedValueOnce({ id: '529', bcp47: 'en' })
      .mockResolvedValueOnce({ id: '21028', bcp47: 'es' })

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result.errors).toBeUndefined()
    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/_lang/en',
      '/home/campaign/outreach-2026/_lang/en/eur',
      '/home/campaign/outreach-2026/_lang/es',
      '/home/campaign/outreach-2026/_lang/es/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur',
      '/outreach.example.org/_lang/en',
      '/outreach.example.org/_lang/en/eur',
      '/outreach.example.org/_lang/es',
      '/outreach.example.org/_lang/es/eur'
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

    const result = await authClient({
      document: CAMPAIGN_DELETE,
      variables: { id: 'campaignId' }
    })

    expect(result.errors?.[0].message).toBe('delete failed')
    expect(mockQueueAdd).not.toHaveBeenCalled()
    expect(writes[0].jobs).toEqual([])
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
