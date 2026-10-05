import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const { mockQueueAdd } = vi.hoisted(() => ({
  mockQueueAdd: vi.fn()
}))

vi.mock('bullmq', () => ({
  Queue: vi.fn(function () {
    return { add: mockQueueAdd }
  })
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignPublish', () => {
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

    expect(mockQueueAdd.mock.calls).toEqual([
      ['revalidate', { paths: ['/home/campaign/christmas-2026'] }],
      ['revalidate', { paths: ['/home/campaign/christmas-2026/eur'] }],
      ['revalidate', { paths: ['/home/campaign/christmas-2026/afr'] }]
    ])
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

  it('throws FORBIDDEN for a member', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await authClient({
      document: CAMPAIGN_PUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to publish campaign',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
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
