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

const mockLinkValidate = linkValidate as MockedFunction<typeof linkValidate>
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignCreate', () => {
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

  const CAMPAIGN_CREATE = graphql(`
    mutation CampaignCreate($input: CampaignCreateInput!) {
      campaignCreate(input: $input) {
        id
        title
        slug
        status
        eyebrow
        description
      }
    }
  `)

  const created = {
    id: 'c1',
    title: 'World Cup 2026',
    slug: 'world-cup-2026',
    status: 'draft',
    eyebrow: null,
    description: ''
  }

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
    prismaMock.campaign.findMany.mockResolvedValue([])
    prismaMock.campaign.create.mockResolvedValue(created as any)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(created as any)
  })

  it('creates a draft with a generated slug and role-filtered, ordered journeys', async () => {
    // First findMany = share filter, second = template filter.
    prismaMock.journey.findMany
      .mockResolvedValueOnce([{ id: 's1' }, { id: 's2' }] as any)
      .mockResolvedValueOnce([{ id: 't1' }] as any)

    const result = await authClient({
      document: CAMPAIGN_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'World Cup 2026',
          shareJourneyIds: ['s2', 's1', 'cross-team'],
          templateJourneyIds: ['t1', 'not-a-template']
        }
      }
    })

    expect(result).toEqual({ data: { campaignCreate: created } })
    expect(prismaMock.campaign.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        team: { connect: { id: 'team-1' } },
        title: 'World Cup 2026',
        slug: 'world-cup-2026',
        status: 'draft',
        journeys: {
          createMany: {
            data: [
              { journeyId: 's2', role: 'share', order: 0 },
              { journeyId: 's1', role: 'share', order: 1 },
              { journeyId: 't1', role: 'template', order: 0 }
            ]
          }
        }
      })
    })
    expect(prismaMock.campaignMedia.create).not.toHaveBeenCalled()
  })

  it('creates the media row after the campaign when media is supplied', async () => {
    mockLinkValidate.mockResolvedValue({
      embedUrl: 'https://www.youtube.com/embed/abc'
    } as any)

    await authClient({
      document: CAMPAIGN_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'World Cup 2026',
          media: { type: 'link', url: 'https://youtu.be/abc' }
        }
      }
    })

    expect(prismaMock.campaignMedia.create).toHaveBeenCalledWith({
      data: {
        campaignId: 'c1',
        type: 'link',
        embedUrl: 'https://www.youtube.com/embed/abc',
        muxVideoId: null,
        muxPlaybackId: null,
        muxName: null,
        muxDuration: null
      }
    })
  })

  it('retries once with a fresh slug on a slug P2002 race', async () => {
    prismaMock.campaign.create
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('unique', {
          code: 'P2002',
          clientVersion: 'x',
          meta: { target: ['slug'] }
        })
      )
      .mockResolvedValueOnce(created as any)
    prismaMock.campaign.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'other', slug: 'world-cup-2026' }] as any)

    const result = await authClient({
      document: CAMPAIGN_CREATE,
      variables: { input: { teamId: 'team-1', title: 'World Cup 2026' } }
    })

    expect(result).toEqual({ data: { campaignCreate: created } })
    expect(prismaMock.campaign.create).toHaveBeenCalledTimes(2)
    expect(prismaMock.campaign.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({ slug: 'world-cup-2026-2' })
    })
  })

  it('rejects a non-https background image before any write', async () => {
    const result = await authClient({
      document: CAMPAIGN_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'World Cup 2026',
          backgroundImageSrc: 'http://insecure.example/bg.jpg'
        }
      }
    })

    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'BAD_USER_INPUT',
            field: 'backgroundImageSrc'
          })
        })
      ]
    })
    expect(prismaMock.campaign.create).not.toHaveBeenCalled()
  })

  it('rejects more than 100 share journeys before any write', async () => {
    const result = await authClient({
      document: CAMPAIGN_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'World Cup 2026',
          shareJourneyIds: Array.from({ length: 101 }, (_, i) => `j${i}`)
        }
      }
    })

    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'BAD_USER_INPUT',
            field: 'shareJourneyIds'
          })
        })
      ]
    })
    expect(prismaMock.campaign.create).not.toHaveBeenCalled()
  })

  it('rejects a caller who is not in the target team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: CAMPAIGN_CREATE,
      variables: { input: { teamId: 'team-OTHER', title: 'X' } }
    })

    expect(result).toMatchObject({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
    expect(prismaMock.campaign.create).not.toHaveBeenCalled()
  })
})
