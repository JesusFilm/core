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
      ['revalidate', { paths: ['/home/campaign/christmas-2026'] }],
      ['revalidate', { paths: ['/home/campaign/christmas-2026/eur'] }],
      ['revalidate', { paths: ['/home/campaign/christmas-2026/afr'] }]
    ])
  })

  it('throws FORBIDDEN for a member', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).published().build()
    )

    const result = await authClient({
      document: CAMPAIGN_UNPUBLISH,
      variables: { id: 'campaignId' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to unpublish campaign',
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
