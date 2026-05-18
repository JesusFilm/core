import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { cache } from '../../yoga'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const invalidateSpy = vi.spyOn(cache, 'invalidate').mockResolvedValue(undefined)

describe('templateGalleryPageUpdate', () => {
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

  const TEMPLATE_GALLERY_PAGE_UPDATE = graphql(`
    mutation TemplateGalleryPageUpdate(
      $id: ID!
      $input: TemplateGalleryPageUpdateInput!
    ) {
      templateGalleryPageUpdate(id: $id, input: $input) {
        id
        title
        slug
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

  it('updates a page when caller is in the team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'New Title',
      slug: 'my-welcome'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'New Title' }
      }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageUpdate: {
          id: 'p1',
          title: 'New Title',
          slug: 'my-welcome'
        }
      }
    })
    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({ title: 'New Title' })
      })
    )
    // Update can change any cacheable field (title here, but also slug,
    // description, templates list, etc.) — must invalidate.
    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith([
      { typename: 'TemplateGalleryPage' }
    ])
    // Ordering invariant: invalidate runs AFTER prisma.$transaction.
    expect(prismaMock.$transaction.mock.invocationCallOrder[0]).toBeLessThan(
      invalidateSpy.mock.invocationCallOrder[0]
    )
  })

  it('throws NOT_FOUND when page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'missing',
        input: { title: 'X' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'template gallery page not found'
        })
      ]
    })
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when caller is not in the page team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'X' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update template gallery page'
        })
      ]
    })
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('replaces journeyIds via deleteMany + createMany when provided', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'j1' },
      { id: 'j2' }
    ] as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { journeyIds: ['j1', 'j2'] }
      }
    })

    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: { templateGalleryPageId: 'p1' }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).toHaveBeenCalledWith({
      data: [
        { templateGalleryPageId: 'p1', journeyId: 'j1', order: 0 },
        { templateGalleryPageId: 'p1', journeyId: 'j2', order: 1 }
      ]
    })
  })

  it('clears all join rows when journeyIds is an empty array', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { journeyIds: [] }
      }
    })

    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: { templateGalleryPageId: 'p1' }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).not.toHaveBeenCalled()
  })

  it('leaves join rows alone when journeyIds is undefined', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'just title' }
      }
    })

    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).not.toHaveBeenCalled()
  })

  it('acquires the page lock before any write to the templates join table', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'j1' }] as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: { id: 'p1', input: { journeyIds: ['j1'] } }
    })

    // Page lock fires via $queryRaw with `FOR UPDATE`.
    expect(prismaMock.$queryRaw).toHaveBeenCalled()
    const lockSql = (
      prismaMock.$queryRaw.mock.calls[0][0] as readonly string[]
    ).join(' ')
    expect(lockSql).toContain('FOR UPDATE')
    // And it ran BEFORE the deleteMany — without this guarantee a concurrent
    // assign can trip the (templateGalleryPageId, order) UNIQUE during the
    // delete+create window.
    const lockOrder = prismaMock.$queryRaw.mock.invocationCallOrder[0]
    const deleteOrder =
      prismaMock.templateGalleryPageTemplate.deleteMany.mock
        .invocationCallOrder[0]
    expect(lockOrder).toBeLessThan(deleteOrder)
  })

  it('throws CONFLICT when journeyIds includes a journey that belongs to another collection', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    // Journey is currently a member of page-B.
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      journeyId: 'j-shared',
      templateGalleryPageId: 'page-B'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: { id: 'page-A', input: { journeyIds: ['j-shared'] } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'journey already belongs to another collection',
          extensions: expect.objectContaining({
            code: 'CONFLICT',
            field: 'journeyIds',
            journeyId: 'j-shared'
          })
        })
      ]
    })
    // Conflict check runs BEFORE deleteMany — the rollback must leave both
    // pages untouched even though the transaction was opened.
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).not.toHaveBeenCalled()
  })

  it('allows re-assigning a journey that is already on this page (NOT clause excludes self)', async () => {
    // Setup: page-A is the only page J belongs to. The conflict findFirst
    // excludes templateGalleryPageId === id (page-A), so it returns null
    // and we proceed with the deleteMany + createMany.
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'j1' }] as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'page-A',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: { id: 'page-A', input: { journeyIds: ['j1'] } }
    })

    // The conflict check ran with the right NOT-self filter so that a
    // journey already on this page does not falsely trigger CONFLICT.
    expect(
      prismaMock.templateGalleryPageTemplate.findFirst
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          journeyId: { in: ['j1'] },
          NOT: { templateGalleryPageId: 'page-A' }
        })
      })
    )
    // And the delete+create still happened.
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({ where: { templateGalleryPageId: 'page-A' } })
    expect(prismaMock.templateGalleryPageTemplate.createMany).toHaveBeenCalled()
  })

  it('rejects user-supplied slug when malformed', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { slug: '   ' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('slug must contain only')
        })
      ]
    })
  })

  it('surfaces P2002 on slug as SlugTakenError (concurrent-Update slug race)', async () => {
    // Two concurrent Updates can both pass validateUserSuppliedSlug
    // (which runs outside the tx); the loser trips the slug UNIQUE
    // constraint at commit. Make sure that surfaces as the same
    // BAD_USER_INPUT/field=slug shape the validation path uses, not a
    // raw Prisma P2002 leaking out as a 500.
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    // validateUserSuppliedSlug's findFirst returns null — slug looks free
    // at validation time, but the inner update races a sibling write.
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique constraint', {
        code: 'P2002',
        clientVersion: '7.0.0',
        meta: { target: ['slug'] }
      })
    )

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: { id: 'p1', input: { slug: 'taken-mid-flight' } }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'slug already in use',
          extensions: expect.objectContaining({
            code: 'BAD_USER_INPUT',
            field: 'slug'
          })
        })
      ]
    })
  })

  it('does not swallow P2002 errors from non-slug targets', async () => {
    // Defensive: only convert P2002 to SlugTakenError when the conflict
    // is actually on the slug column. Other P2002s (e.g. from the join
    // table) must propagate so the caller sees the real failure.
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('other unique constraint', {
        code: 'P2002',
        clientVersion: '7.0.0',
        meta: { target: ['someOtherColumn'] }
      })
    )

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: { id: 'p1', input: { title: 'new title' } }
    })

    // Surfaces as the raw Prisma error wrapped by GraphQL, NOT as
    // SlugTakenError.
    expect(result).not.toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'slug already in use' })]
    })
  })

  it('writes creatorImageSrc and creatorImageAlt as plain scalars', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: {
          creatorImageSrc: 'https://images.example.com/alice.jpg',
          creatorImageAlt: 'Alice headshot'
        }
      }
    })

    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({
          creatorImageSrc: 'https://images.example.com/alice.jpg',
          creatorImageAlt: 'Alice headshot'
        })
      })
    )
  })

  it('rejects creatorImageSrc with non-https scheme', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { creatorImageSrc: 'http://example.com/alice.jpg' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('https')
        })
      ]
    })
    expect(prismaMock.templateGalleryPage.update).not.toHaveBeenCalled()
  })

  it('clears creatorImageSrc and creatorImageAlt when input is explicitly null', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { creatorImageSrc: null, creatorImageAlt: null }
      }
    })

    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          creatorImageSrc: null,
          creatorImageAlt: null
        })
      })
    )
  })

  it('leaves creatorImageSrc and creatorImageAlt alone when input is undefined', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'just title' }
      }
    })

    const updateCall = prismaMock.templateGalleryPage.update.mock.calls[0][0]
    expect(updateCall.data).not.toHaveProperty('creatorImageSrc')
    expect(updateCall.data).not.toHaveProperty('creatorImageAlt')
  })

  it('clears mediaUrl when input is explicitly null', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { mediaUrl: null }
      }
    })

    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mediaUrl: null })
      })
    )
  })
})
