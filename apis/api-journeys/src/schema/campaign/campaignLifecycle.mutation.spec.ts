import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

// campaignPublish / campaignUnpublish / campaignDelete share the same auth
// preamble and error shape, so they are covered together.
describe('campaign lifecycle mutations', () => {
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

  const PUBLISH = graphql(`
    mutation CampaignPublish($id: ID!) {
      campaignPublish(id: $id) {
        id
        status
        publishedAt
      }
    }
  `)
  const UNPUBLISH = graphql(`
    mutation CampaignUnpublish($id: ID!) {
      campaignUnpublish(id: $id) {
        id
        status
        publishedAt
      }
    }
  `)
  const DELETE = graphql(`
    mutation CampaignDelete($id: ID!) {
      campaignDelete(id: $id) {
        id
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
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'ut',
      teamId: 'team-1',
      userId: mockUser.id
    } as any)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('publish: transitions a draft and stamps publishedAt once', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      status: 'draft'
    } as any)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      id: 'c1',
      status: 'published',
      publishedAt: new Date('2026-09-24T00:00:00Z')
    } as any)

    const result = await authClient({
      document: PUBLISH,
      variables: { id: 'c1' }
    })

    expect(result).toEqual({
      data: {
        campaignPublish: {
          id: 'c1',
          status: 'published',
          publishedAt: '2026-09-24T00:00:00.000Z'
        }
      }
    })
    expect(prismaMock.campaign.updateMany).toHaveBeenCalledWith({
      where: { id: 'c1', status: 'draft' },
      data: { status: 'published', publishedAt: expect.any(Date) }
    })
  })

  it('publish: is idempotent on an already-published campaign (no re-stamp)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      status: 'published'
    } as any)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      id: 'c1',
      status: 'published',
      publishedAt: new Date('2026-01-01T00:00:00Z')
    } as any)

    const result = await authClient({
      document: PUBLISH,
      variables: { id: 'c1' }
    })

    expect(result).toMatchObject({
      data: { campaignPublish: { publishedAt: '2026-01-01T00:00:00.000Z' } }
    })
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
  })

  it('unpublish: reverts to draft and keeps publishedAt', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      status: 'published'
    } as any)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
      id: 'c1',
      status: 'draft',
      publishedAt: new Date('2026-01-01T00:00:00Z')
    } as any)

    const result = await authClient({
      document: UNPUBLISH,
      variables: { id: 'c1' }
    })

    expect(result).toEqual({
      data: {
        campaignUnpublish: {
          id: 'c1',
          status: 'draft',
          publishedAt: '2026-01-01T00:00:00.000Z'
        }
      }
    })
    expect(prismaMock.campaign.updateMany).toHaveBeenCalledWith({
      where: { id: 'c1', status: 'published' },
      data: { status: 'draft' }
    })
  })

  it('publish: surfaces a P2025 on the re-read as NOT_FOUND', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      status: 'draft'
    } as any)
    prismaMock.campaign.updateMany.mockResolvedValue({ count: 0 })
    prismaMock.campaign.findUniqueOrThrow.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('gone', {
        code: 'P2025',
        clientVersion: 'x'
      })
    )

    const result = await authClient({
      document: PUBLISH,
      variables: { id: 'c1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'campaign not found' })]
    })
  })

  it('delete: hard-deletes when the caller is in the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1'
    } as any)
    prismaMock.campaign.delete.mockResolvedValue({ id: 'c1' } as any)

    const result = await authClient({
      document: DELETE,
      variables: { id: 'c1' }
    })

    expect(result).toEqual({ data: { campaignDelete: { id: 'c1' } } })
    expect(prismaMock.campaign.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'c1' } })
    )
  })

  it('all three: NOT_FOUND for an unknown id and FORBIDDEN outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)
    for (const document of [PUBLISH, UNPUBLISH, DELETE]) {
      const result = await authClient({ document, variables: { id: 'x' } })
      expect(result).toMatchObject({
        data: null,
        errors: [expect.objectContaining({ message: 'campaign not found' })]
      })
    }

    prismaMock.campaign.findUnique.mockResolvedValue({
      id: 'c1',
      teamId: 'team-OTHER',
      status: 'draft'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)
    for (const [document, verb] of [
      [PUBLISH, 'publish'],
      [UNPUBLISH, 'unpublish'],
      [DELETE, 'delete']
    ] as const) {
      const result = await authClient({ document, variables: { id: 'c1' } })
      expect(result).toMatchObject({
        data: null,
        errors: [
          expect.objectContaining({
            message: `user is not allowed to ${verb} campaign`
          })
        ]
      })
    }
    expect(prismaMock.campaign.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.campaign.delete).not.toHaveBeenCalled()
  })
})
