import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { linkValidate } from '../templateGalleryPage/media/linkValidate'
import { muxValidate } from '../templateGalleryPage/media/muxValidate'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))
vi.mock('../templateGalleryPage/media/linkValidate', () => ({
  linkValidate: vi.fn()
}))
vi.mock('../templateGalleryPage/media/muxValidate', () => ({
  muxValidate: vi.fn()
}))

const mockMuxValidate = muxValidate as MockedFunction<typeof muxValidate>
const mockLinkValidate = linkValidate as MockedFunction<typeof linkValidate>
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignUpdate', () => {
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

  const CAMPAIGN_UPDATE = graphql(`
    mutation CampaignUpdate($id: ID!, $input: CampaignUpdateInput!) {
      campaignUpdate(id: $id, input: $input) {
        id
        title
        slug
      }
    }
  `)

  const updated = { id: 'c1', title: 'New Title', slug: 'world-cup' }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'ut',
      teamId: 'team-1',
      userId: mockUser.id
    } as any)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1'
    } as any)
    prismaMock.campaign.update.mockResolvedValue(updated as any)
  })

  it('applies tri-state scalars: omitted leaves alone, null clears, value sets', async () => {
    const result = await authClient({
      document: CAMPAIGN_UPDATE,
      variables: {
        id: 'c1',
        input: { title: 'New Title', eyebrow: null, tagline: 'Every match' }
      }
    })

    expect(result).toEqual({ data: { campaignUpdate: updated } })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c1' },
        data: {
          title: 'New Title',
          description: undefined,
          statsFrom: undefined,
          slug: undefined,
          eyebrow: null,
          tagline: 'Every match'
        }
      })
    )
    expect(prismaMock.campaignJourney.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignMedia.upsert).not.toHaveBeenCalled()
  })

  it('replaces only the provided role list, in order', async () => {
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 's1' },
      { id: 's2' }
    ] as any)

    await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'c1', input: { shareJourneyIds: ['s2', 's1', 'bad'] } }
    })

    expect(prismaMock.campaignJourney.deleteMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.campaignJourney.deleteMany).toHaveBeenCalledWith({
      where: { campaignId: 'c1', role: 'share' }
    })
    expect(prismaMock.campaignJourney.createMany).toHaveBeenCalledWith({
      data: [
        { campaignId: 'c1', journeyId: 's2', role: 'share', order: 0 },
        { campaignId: 'c1', journeyId: 's1', role: 'share', order: 1 }
      ]
    })
  })

  it('clears a role list when given an empty array', async () => {
    await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'c1', input: { templateJourneyIds: [] } }
    })

    expect(prismaMock.campaignJourney.deleteMany).toHaveBeenCalledWith({
      where: { campaignId: 'c1', role: 'template' }
    })
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignJourney.createMany).not.toHaveBeenCalled()
  })

  it('validates a user-supplied slug and maps a commit-time P2002 to the slug field', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null)
    prismaMock.campaign.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'x',
        meta: { target: ['slug'] }
      })
    )

    const result = await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'c1', input: { slug: 'Euro Cup' } }
    })

    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
      where: { slug: 'euro-cup', NOT: { id: 'c1' } },
      select: { id: true }
    })
    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'slug already in use',
          extensions: expect.objectContaining({ field: 'slug' })
        })
      ]
    })
  })

  it('upserts media with per-slot merge semantics', async () => {
    mockMuxValidate.mockResolvedValue({
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb-1',
      muxName: 'Clip',
      muxDuration: 30
    })

    await authClient({
      document: CAMPAIGN_UPDATE,
      variables: {
        id: 'c1',
        input: { media: { type: 'mux', muxVideoId: 'vid-1', url: null } }
      }
    })

    expect(mockLinkValidate).not.toHaveBeenCalled()
    expect(prismaMock.campaignMedia.upsert).toHaveBeenCalledWith({
      where: { campaignId: 'c1' },
      create: {
        campaignId: 'c1',
        type: 'mux',
        embedUrl: null,
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb-1',
        muxName: 'Clip',
        muxDuration: 30
      },
      update: {
        type: 'mux',
        embedUrl: null,
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb-1',
        muxName: 'Clip',
        muxDuration: 30
      }
    })
  })

  it('maps a concurrent journey-order P2002 to CONFLICT', async () => {
    prismaMock.journey.findMany.mockResolvedValue([{ id: 's1' }] as any)
    prismaMock.campaignJourney.createMany.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'x',
        meta: { target: ['campaignId', 'role', 'order'] }
      })
    )

    const result = await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'c1', input: { shareJourneyIds: ['s1'] } }
    })

    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'CONFLICT',
            field: 'journeys'
          })
        })
      ]
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND / FORBIDDEN before validating input', async () => {
    prismaMock.campaign.findUnique.mockResolvedValueOnce(null)
    const missing = await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'missing', input: { title: 'X' } }
    })
    expect(missing).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'campaign not found' })]
    })

    prismaMock.campaign.findUnique.mockResolvedValueOnce({
      id: 'c1',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)
    const forbidden = await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'c1', input: { title: 'X' } }
    })
    expect(forbidden).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update campaign'
        })
      ]
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })
})
