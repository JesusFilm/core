import { GraphQLError } from 'graphql'
import { vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { mockAddressSnapshots } from '../../../test/campaignAddressSnapshot'
import { campaignFactory } from '../../../test/campaignFactory'
import { mockTransaction } from '../../../test/campaignWrite'
import { prismaMock } from '../../../test/prismaMock'

import { setCampaignStatus } from './setCampaignStatus'

vi.mock('./gatewayClient', () => ({
  fetchLanguage: vi.fn(async (id: string) => ({ id, bcp47: 'en' }))
}))

const user = {
  id: 'userId',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'Test',
  lastName: 'User',
  imageUrl: null,
  roles: []
}

const draft = campaignFactory({ role: 'manager' }).withRegion('EUR').build()
const published = campaignFactory({ role: 'manager' })
  .withRegion('EUR')
  .published()
  .build()

function queuedPaths(): string[] {
  return mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])
}

describe('setCampaignStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTransaction(prismaMock)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
  })

  it('publishes a draft: writes status and publishedAt, and queues its pages', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    mockAddressSnapshots(draft, published)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(published)

    expect(await setCampaignStatus({}, 'campaignId', 'publish', user)).toBe(
      published
    )
    expect(prismaMock.campaign.updateMany).toHaveBeenCalledWith({
      where: { id: 'campaignId', status: 'draft' },
      data: { status: 'published', publishedAt: expect.any(Date) }
    })
    expect(queuedPaths()).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/_lang/en',
      '/home/campaign/outreach-2026/_lang/en/eur'
    ])
  })

  it('unpublishes a published campaign: writes draft, keeps publishedAt, and queues its pages', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    mockAddressSnapshots(published, { ...published, status: 'draft' })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      ...published,
      status: 'draft'
    })

    await setCampaignStatus({}, 'campaignId', 'unpublish', user)

    expect(prismaMock.campaign.updateMany).toHaveBeenCalledWith({
      where: { id: 'campaignId', status: 'published' },
      data: { status: 'draft' }
    })
    expect(queuedPaths()).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/_lang/en',
      '/home/campaign/outreach-2026/_lang/en/eur'
    ])
  })

  it('writes and queues nothing for a campaign already in the target status', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(published)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(published)

    expect(await setCampaignStatus({}, 'campaignId', 'publish', user)).toBe(
      published
    )
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('queues nothing when the race is lost: the winner already published it', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    mockAddressSnapshots(published, published)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 0 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(published)

    expect(await setCampaignStatus({}, 'campaignId', 'publish', user)).toBe(
      published
    )
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND when the re-read finds no campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(draft)
    mockAddressSnapshots(null)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 0 })
    prismaMock.campaign.findUniqueOrThrow.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('No record found', {
        code: 'P2025',
        clientVersion: 'test'
      })
    )

    const error = await setCampaignStatus(
      {},
      'campaignId',
      'publish',
      user
    ).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(GraphQLError)
    expect(error).toMatchObject({
      message: 'campaign not found',
      extensions: { code: 'NOT_FOUND' }
    })
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })
})
