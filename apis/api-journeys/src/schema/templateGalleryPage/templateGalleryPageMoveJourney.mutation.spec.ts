import { type MockedFunction, vi } from 'vitest'

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

describe('templateGalleryPageMoveJourney', () => {
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

  const TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY = graphql(`
    mutation TemplateGalleryPageMoveJourney(
      $journeyId: ID!
      $fromPageId: ID!
      $toPageId: ID!
    ) {
      templateGalleryPageMoveJourney(
        journeyId: $journeyId
        fromPageId: $fromPageId
        toPageId: $toPageId
      ) {
        id
      }
    }
  `)

  const variables = {
    journeyId: 'journey-1',
    fromPageId: 'page-A',
    toPageId: 'page-B'
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
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      { id: 'page-A', teamId: 'team-1' },
      { id: 'page-B', teamId: 'team-1' }
    ] as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: true,
      deletedAt: null
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-1' }
    ] as any)
    prismaMock.templateGalleryPageTemplate.aggregate.mockResolvedValue({
      _max: { order: 3 }
    } as any)
  })

  it('relocates the row to the destination, keeping its role, and renumbers both pages', async () => {
    // First lookup: source row exists. Second lookup: not on the target.
    prismaMock.templateGalleryPageTemplate.findUnique
      .mockResolvedValueOnce({ id: 'tpt-source' } as any)
      .mockResolvedValueOnce(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageMoveJourney: [{ id: 'page-A' }, { id: 'page-B' }]
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpt-source' },
      data: { templateGalleryPageId: 'page-B', order: 4 }
    })
    // Role travels with the row: nothing rewrites isHome.
    expect(
      prismaMock.templateGalleryPageTemplate.update
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isHome: expect.anything() })
      })
    )
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
    // Both pages renumbered (two renumber reads).
    expect(
      prismaMock.templateGalleryPageTemplate.findMany
    ).toHaveBeenCalledTimes(2)
  })

  it('keeps both memberships unchanged when a concurrent link already placed the journey on the destination', async () => {
    prismaMock.templateGalleryPageTemplate.findUnique
      .mockResolvedValueOnce({ id: 'tpt-source' } as Awaited<
        ReturnType<typeof prismaMock.templateGalleryPageTemplate.findUnique>
      >)
      .mockResolvedValueOnce({ id: 'tpt-target' } as Awaited<
        ReturnType<typeof prismaMock.templateGalleryPageTemplate.findUnique>
      >)
      .mockResolvedValueOnce({ id: 'tpt-source', isHome: true } as Awaited<
        ReturnType<typeof prismaMock.templateGalleryPageTemplate.findUnique>
      >)
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-link-C',
      templateGalleryPageId: 'page-C'
    } as Awaited<
      ReturnType<typeof prismaMock.templateGalleryPageTemplate.findFirst>
    >)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageMoveJourney: [{ id: 'page-A' }, { id: 'page-B' }]
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
    expect(
      prismaMock.templateGalleryPageTemplate.aggregate
    ).not.toHaveBeenCalled()
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
  })

  it('throws BAD_USER_INPUT when the journey is not on the source page', async () => {
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'BAD_USER_INPUT',
            field: 'journeyId'
          })
        })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
  })

  it('returns the page unchanged when source and destination are the same', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      { id: 'page-A', teamId: 'team-1' }
    ] as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables: { ...variables, toPageId: 'page-A' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageMoveJourney: [{ id: 'page-A' }] }
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when either page is missing', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      { id: 'page-A', teamId: 'team-1' }
    ] as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
  })

  it('throws FORBIDDEN when the pages belong to different teams', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      { id: 'page-A', teamId: 'team-1' },
      { id: 'page-B', teamId: 'team-2' }
    ] as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when the caller is not in the team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY,
      variables
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })
})
