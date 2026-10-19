import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { fetchLanguage } from './gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const { mockQueueAdd } = vi.hoisted(() => ({
  mockQueueAdd: vi.fn()
}))

vi.mock('./gatewayClient', () => ({ fetchLanguage: vi.fn() }))

vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: mockQueueAdd }
  })
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignUnpublish', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CAMPAIGN_UNPUBLISH = graphql(`
    mutation CampaignUnpublish($id: ID!) {
      campaignUnpublish(id: $id) {
        id
        status
        publishedAt
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    mockQueueAdd.mockResolvedValue(undefined)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('moves published to draft and keeps publishedAt for a manager', async () => {
    const published = campaignFactory({ role: 'manager' }).published().build()
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...published,
      status: 'draft'
    })

    const result = await authClient({
      document: CAMPAIGN_UNPUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: {
        campaignUnpublish: {
          id: 'campaignId',
          status: 'draft',
          publishedAt: '2026-10-05T00:00:00.000Z'
        }
      }
    })
    expect(prismaMock.campaign.updateMany).toHaveBeenCalledWith({
      where: { id: 'campaignId', status: 'published' },
      data: { status: 'draft' }
    })
  })

  it('is idempotent on an already-draft campaign: no write, no revalidation', async () => {
    const draft = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(draft)

    const result = await authClient({
      document: CAMPAIGN_UNPUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: {
        campaignUnpublish: {
          id: 'campaignId',
          status: 'draft',
          publishedAt: null
        }
      }
    })
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('also revalidates the _lang page of every campaign language, so an unpublish reaches ?lang= visitors', async () => {
    const published = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...published,
      status: 'draft'
    })
    prismaMock.campaignLanguage.findMany.mockResolvedValue([
      { languageId: '529' },
      { languageId: '21028' }
    ] as any)
    vi.mocked(fetchLanguage)
      .mockResolvedValueOnce({ id: '529', bcp47: 'en' })
      .mockResolvedValueOnce({ id: '21028', bcp47: 'es' })

    await authClient({
      document: CAMPAIGN_UNPUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/_lang/en',
      '/home/campaign/outreach-2026/_lang/en/eur',
      '/home/campaign/outreach-2026/_lang/es',
      '/home/campaign/outreach-2026/_lang/es/eur'
    ])
  })

  it('enqueues exactly one revalidate job per affected path through the paths[] variant', async () => {
    const published = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .withRegion('AFR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...published,
      status: 'draft'
    })

    await authClient({
      document: CAMPAIGN_UNPUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(mockQueueAdd.mock.calls).toEqual([
      ['revalidate', { paths: ['/home/campaign/outreach-2026'] }],
      ['revalidate', { paths: ['/home/campaign/outreach-2026/eur'] }],
      ['revalidate', { paths: ['/home/campaign/outreach-2026/afr'] }]
    ])
  })

  it('unpublishes for a member too: publishing is editing', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).published().build()
    )
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = (await authClient({
      document: CAMPAIGN_UNPUBLISH,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignUnpublish.status).toBe('draft')
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN_UNPUBLISH,
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
  })
})
