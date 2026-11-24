import { type MockedFunction, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

import { Journey, TemplateGalleryPage } from '@core/prisma/journeys/client'
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

describe('templateGalleryPageBySlug', () => {
  const publicClient = getClient()

  const TEMPLATE_GALLERY_PAGE_BY_SLUG = graphql(`
    query TemplateGalleryPageBySlug($slug: String!) {
      templateGalleryPageBySlug(slug: $slug) {
        id
        title
        slug
        status
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(null)
  })

  it('returns a published page to an unauthenticated visitor', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
      id: 'p1',
      title: 'Hello',
      slug: 'hello',
      status: 'published'
    } as any)

    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'hello' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageBySlug: {
          id: 'p1',
          title: 'Hello',
          slug: 'hello',
          status: 'published'
        }
      }
    })
    expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'hello', status: 'published' }
      })
    )
  })

  it('returns only published templates to an unauthenticated visitor', async () => {
    const journeys = [
      { id: 'draft-template', status: 'draft' as const },
      { id: 'published-template', status: 'published' as const }
    ].map((journey) => ({
      ...mockDeep<Journey>(),
      teamId: 'team-1',
      template: true,
      deletedAt: null,
      ...journey
    }))
    prismaMock.templateGalleryPage.findFirst.mockImplementation((args) => {
      const selection = args?.include?.templates
      const where = typeof selection === 'object' ? selection.where : undefined
      const journeyWhere = where?.journey
      const status =
        journeyWhere != null && 'status' in journeyWhere
          ? journeyWhere.status
          : undefined
      const templates = journeys.filter((journey) => {
        if (typeof status === 'string') return journey.status === status
        return Array.isArray(status?.in)
          ? status.in.includes(journey.status)
          : true
      })
      return Promise.resolve({
        ...mockDeep<TemplateGalleryPage>(),
        id: 'p1',
        teamId: 'team-1',
        templates: templates.map((journey) => ({ journey }))
      }) as unknown as ReturnType<
        typeof prismaMock.templateGalleryPage.findFirst
      >
    })

    const result = await publicClient({
      document: graphql(`
        query PublicTemplateGalleryPageAssignedTemplates($slug: String!) {
          templateGalleryPageBySlug(slug: $slug) {
            templates {
              id
            }
          }
        }
      `),
      variables: { slug: 'hello' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageBySlug: {
          templates: [{ id: 'published-template' }]
        }
      }
    })
    expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          templates: expect.objectContaining({
            where: {
              journey: {
                template: true,
                status: 'published',
                deletedAt: null
              }
            }
          })
        })
      })
    )
  })

  it('returns null when slug is unknown', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue(null)

    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'missing' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
  })

  it('returns null for a draft slug — the where filter excludes non-published rows', async () => {
    // The DB row exists with the requested slug but its status is `draft`.
    // The resolver's `where: { slug, status: 'published' }` filter excludes
    // it, so prisma returns null and the resolver hands the visitor a 404.
    // This test pins the documented contract that drafts are NEVER reachable
    // via the public bySlug entry point — anonymous traffic can only see
    // published rows.
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue(null)

    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'draft-slug' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
    // Pin the gatekeeper SQL filter: changing this where clause would change
    // the public contract.
    expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'draft-slug', status: 'published' }
      })
    )
  })

  it('returns null without hitting the DB when slug is malformed', async () => {
    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'NOT VALID!!' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
    expect(prismaMock.templateGalleryPage.findFirst).not.toHaveBeenCalled()
  })

  it('returns null without hitting the DB when slug exceeds max length', async () => {
    const longSlug = 'a'.repeat(201)
    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: longSlug }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
    expect(prismaMock.templateGalleryPage.findFirst).not.toHaveBeenCalled()
  })
})
