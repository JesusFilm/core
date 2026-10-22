import { vi } from 'vitest'

import { mockQueueAdd } from '../../../test/bullmqMock'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../test/campaignBlockSpec'
import { campaignFactory } from '../../../test/campaignFactory'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignPublish', () => {
  const CAMPAIGN_PUBLISH = graphql(`
    mutation CampaignPublish($id: ID!) {
      campaignPublish(id: $id) {
        id
        status
        publishedAt
      }
    }
  `)

  beforeEach(() => {
    setupCampaignBlockSpec()
  })

  it('moves draft to published and stamps publishedAt for a manager', async () => {
    const draft = campaignFactory({ role: 'manager' }).build()
    const published = campaignFactory({ role: 'manager' }).published().build()
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(published)

    const result = await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: {
        campaignPublish: {
          id: 'campaignId',
          status: 'published',
          publishedAt: '2026-10-05T00:00:00.000Z'
        }
      }
    })
    expect(prismaMock.campaign.updateMany).toHaveBeenCalledWith({
      where: { id: 'campaignId', status: 'draft' },
      data: { status: 'published', publishedAt: expect.any(Date) }
    })
  })

  it('is idempotent on an already-published campaign: no write, no re-stamp, no revalidation', async () => {
    const published = campaignFactory({ role: 'manager' }).published().build()
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(published)

    const result = await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: {
        campaignPublish: {
          id: 'campaignId',
          status: 'published',
          publishedAt: '2026-10-05T00:00:00.000Z'
        }
      }
    })
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('enqueues exactly one revalidate job per affected path through the paths[] variant', async () => {
    const draft = campaignFactory({ role: 'manager' })
      .withRegion('EUR')
      .withRegion('AFR')
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...draft,
      status: 'published'
    })

    await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/afr'
    ])
  })

  it('also revalidates the domain form of every attached Campaign Root domain', async () => {
    const draft = campaignFactory({ role: 'manager' }).withRegion('EUR').build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...draft,
      customDomains: [{ name: 'outreach.example.org' }]
    } as any)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...draft,
      status: 'published'
    })

    await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur'
    ])
  })

  it('still publishes when queueing a revalidation fails', async () => {
    const draft = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...draft,
      status: 'published'
    })
    mockQueueAdd.mockRejectedValue(new Error('redis down'))

    const result = (await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.data.campaignPublish.status).toBe('published')
  })

  it('queues nothing when the publish race is lost', async () => {
    const draft = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 0 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...draft,
      status: 'published'
    })

    const result = (await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.data.campaignPublish.status).toBe('published')
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('publishes for a member too: publishing is editing', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).published().build()
    )

    const result = (await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignPublish.status).toBe('published')
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN_PUBLISH,
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
